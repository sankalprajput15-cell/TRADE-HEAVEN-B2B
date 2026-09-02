const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const stat = fs.statSync(dirPath);
    if (stat.isDirectory()) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

walkDir('./src', (filePath) => {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = content;
  updated = updated.replace(/ec21/g, 'th');
  updated = updated.replace(/EC21/g, 'TH');
  updated = updated.replace(/Ec21/g, 'Th');
  
  if (updated !== content) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});

const oldPath = path.join('./src/data/ec21LobstersData.ts');
const newPath = path.join('./src/data/thLobstersData.ts');
if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath);
  console.log(`Renamed ${oldPath} to ${newPath}`);
}
