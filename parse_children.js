const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

// just grep for the first level children of the main return block
const startIdx = code.indexOf('<div className="min-h-screen');
const endIdx = code.indexOf('</GlobalErrorBoundary>');
console.log(code.substring(startIdx, startIdx + 1500));
