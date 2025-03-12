const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    baseUrl: '/portfolio',
    sourceFile: '_site/index.html',
    patterns: [
        { from: 'href="/', to: 'href="/portfolio/' },
        { from: 'src="/', to: 'src="/portfolio/' },
        { from: 'href="http://localhost:4000"', to: 'href="https://alvaropanizo.github.io/portfolio"' },
        { from: 'content="http://localhost:4000"', to: 'content="https://alvaropanizo.github.io/portfolio"' }
    ]
};

// Read the file
console.log('Reading file:', config.sourceFile);
let content = fs.readFileSync(config.sourceFile, 'utf8');

// Apply replacements
config.patterns.forEach(pattern => {
    content = content.replace(new RegExp(pattern.from, 'g'), pattern.to);
});

// Write back the file
console.log('Writing modified file...');
fs.writeFileSync(config.sourceFile, content, 'utf8');
console.log('Build script completed successfully!'); 