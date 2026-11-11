// Dedicated automated deployment script for BigRock / cPanel FTPS deployment
const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

async function deploy() {
  const client = new ftp.Client(180000); // 3-minute timeout
  client.ftp.verbose = true;

  let rawHost = process.env.FTP_SERVER || process.env.SFTP_HOST || 'tradeheaven.net';
  let cleanHost = rawHost.replace(/^(ftp|ftps|http|https|ssh|sftp):\/\//i, '').replace(/[\/:]+.*$/, '').trim();
  if (!cleanHost || cleanHost === '127.0.0.1' || cleanHost === 'localhost' || cleanHost.startsWith('127.') || cleanHost === '0.0.0.0' || cleanHost === 'ftp.tradeheaven.net') {
    cleanHost = 'tradeheaven.net';
  }

  const user = process.env.FTP_USERNAME || process.env.SFTP_USERNAME || 'a17604c7';
  const password = process.env.FTP_PASSWORD || process.env.SFTP_PASSWORD || '';
  const port = parseInt(process.env.FTP_PORT || '21', 10);

  console.log(`[DEPLOY] Connecting to FTPS server: ${cleanHost}:${port} (user: ${user})...`);

  if (!password) {
    console.error('[DEPLOY ERROR] FTP_PASSWORD secret is missing or empty in environment.');
    process.exit(1);
  }

  const distDir = path.resolve(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    console.error(`[DEPLOY ERROR] Local build directory "${distDir}" does not exist. Did "npm run build" finish?`);
    process.exit(1);
  }

  // Ensure api.php and .htaccess are in dist
  const rootApiPhp = path.resolve(__dirname, '..', 'api.php');
  const distApiPhp = path.join(distDir, 'api.php');
  if (fs.existsSync(rootApiPhp) && !fs.existsSync(distApiPhp)) {
    fs.copyFileSync(rootApiPhp, distApiPhp);
    console.log('[DEPLOY] Copied api.php into dist/');
  }

  const rootHtaccess = path.resolve(__dirname, '..', '.htaccess');
  const distHtaccess = path.join(distDir, '.htaccess');
  if (fs.existsSync(rootHtaccess) && !fs.existsSync(distHtaccess)) {
    fs.copyFileSync(rootHtaccess, distHtaccess);
    console.log('[DEPLOY] Copied .htaccess into dist/');
  }

  let connected = false;

  // Attempt 1: FTPS with secure: "loose" (accepts self-signed / shared cPanel TLS certificates)
  try {
    console.log('[DEPLOY] Trying FTPS (Explicit TLS) with secure: "loose"...');
    await client.access({
      host: cleanHost,
      port: port,
      user: user,
      password: password,
      secure: 'loose'
    });
    console.log('[DEPLOY SUCCESS] Connected securely via FTPS (TLS).');
    connected = true;
  } catch (err) {
    console.warn('[DEPLOY WARN] FTPS connection attempt failed:', err.message);
  }

  // Attempt 2: Standard FTP if FTPS fails
  if (!connected) {
    try {
      console.log('[DEPLOY] Falling back to standard FTP (port 21)...');
      client.close();
      await client.access({
        host: cleanHost,
        port: port,
        user: user,
        password: password,
        secure: false
      });
      console.log('[DEPLOY SUCCESS] Connected via standard FTP.');
      connected = true;
    } catch (err) {
      console.error('[DEPLOY ERROR] FTP connection failed completely:', err);
      process.exit(1);
    }
  }

  try {
    const currentPwd = await client.pwd();
    console.log(`[DEPLOY] Current remote working directory: ${currentPwd}`);

    // Check directory listing to see if we are in /home3/a17604c7 or already inside public_html
    const list = await client.list();
    const dirNames = list.map(item => item.name);
    console.log(`[DEPLOY] Remote items found in ${currentPwd}:`, dirNames.slice(0, 10).join(', '));

    let targetDir = process.env.FTP_SERVER_DIR || '';
    if (!targetDir) {
      if (dirNames.includes('public_html')) {
        targetDir = 'public_html';
      } else {
        targetDir = '.';
      }
    }

    if (targetDir && targetDir !== '.' && targetDir !== './') {
      console.log(`[DEPLOY] Entering target directory: "${targetDir}"...`);
      await client.ensureDir(targetDir);
    }

    const finalPwd = await client.pwd();
    console.log(`[DEPLOY] Uploading build files to remote directory: ${finalPwd}...`);

    await client.uploadFromDir(distDir);
    console.log(`[DEPLOY SUCCESS] All files from "${distDir}" uploaded successfully to "${finalPwd}"!`);

    // Verify key files
    const postList = await client.list();
    const uploadedNames = postList.map(item => item.name);
    console.log(`[DEPLOY VERIFY] Remote files present: index.html=${uploadedNames.includes('index.html')}, api.php=${uploadedNames.includes('api.php')}, .htaccess=${uploadedNames.includes('.htaccess')}`);

    console.log('[DEPLOY COMPLETE] Website deployment completed successfully.');
  } catch (uploadErr) {
    console.error('[DEPLOY ERROR] Failed during file upload / directory change:', uploadErr);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy().catch(err => {
  console.error('[DEPLOY FATAL]', err);
  process.exit(1);
});
