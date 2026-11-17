import fs from 'node:fs';
import path from 'node:path';

const uploadsDir = path.join(process.cwd(), 'public', 'assets', 'uploads');
const snapPath = path.join(process.cwd(), 'public', 'data', 'fullCatalogSnapshot.json');
const statePath = path.join(process.cwd(), 'public', 'data', 'productImageSystemState.json');
const overridesBackupPath = path.join(process.cwd(), 'src', 'data', 'productImageOverridesBackup.json');
const pubOverridesPath = path.join(process.cwd(), 'public', 'assets', 'uploads', 'product-image-overrides.json');

const beltFiles = fs.readdirSync(uploadsDir).filter(f => f.startsWith('auto-leather-belt-') && f.endsWith('.webp') && fs.statSync(path.join(uploadsDir, f)).size >= 3500);
console.log('Found verified leather belt files on disk:', beltFiles.length);

const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));

let beltIdx = 0;
const nowIso = new Date().toISOString();

for (const item of snap) {
  const t = (item.title || '').toLowerCase();
  const c = (item.category || '').toLowerCase();
  if (/leather belt|scaffolding belt|cowhide belt|dress belt|waist belt|bridle leather/i.test(t) || /leather belts/i.test(c)) {
    const f = beltFiles[beltIdx % beltFiles.length];
    beltIdx++;
    const imgUrl = `/assets/uploads/${f}`;
    item.image_url = imgUrl;
    item.image = imgUrl;
    item.images = [imgUrl];

    if (!state.overrides) state.overrides = {};
    state.overrides[item.id] = {
      primary: imgUrl,
      gallery: [imgUrl],
      format: 'WEBP',
      updatedAt: nowIso,
      updatedBy: 'leather-belt-fixer'
    };
  }
}

fs.writeFileSync(snapPath, JSON.stringify(snap, null, 2), 'utf8');
fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
fs.writeFileSync(overridesBackupPath, JSON.stringify(state, null, 2), 'utf8');
fs.writeFileSync(pubOverridesPath, JSON.stringify(state, null, 2), 'utf8');

console.log('Successfully assigned dedicated leather belt images to all leather belt products (' + beltIdx + ' items updated).');
