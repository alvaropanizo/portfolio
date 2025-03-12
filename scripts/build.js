const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    baseUrl: '/portfolio',
    sourceFile: '_site/index.html',
    patterns: [
        // Handle absolute paths in href and src attributes
        { from: /(href|src)=["']\//g, to: '$1="/portfolio/' },
        
        // Handle meta tags and canonical URLs
        { from: /(href|content)="http:\/\/localhost:4000/g, to: '$1="https://alvaropanizo.github.io/portfolio' },
        
        // Fix canonical URL (remove double portfolio)
        { from: /\/portfolio\/portfolio/g, to: '/portfolio' },
        
        // Handle any remaining absolute URLs to alvaropanizo.github.io
        { from: /https:\/\/alvaropanizo\.github\.io\/assets\//g, to: 'https://alvaropanizo.github.io/portfolio/assets/' },
        { from: /"https:\/\/alvaropanizo\.github\.io\//g, to: '"https://alvaropanizo.github.io/portfolio/' }
    ]
};

// Read the file
console.log('Reading file:', config.sourceFile);
let content = fs.readFileSync(config.sourceFile, 'utf8');

// Apply replacements
config.patterns.forEach(pattern => {
    const matches = content.match(pattern.from);
    if (matches) {
        console.log(`Found ${matches.length} matches for pattern: ${pattern.from}`);
    }
    content = content.replace(pattern.from, pattern.to);
});

// Write back the file
console.log('Writing modified file...');
fs.writeFileSync(config.sourceFile, content, 'utf8');

// Verify replacements
console.log('\nVerifying final content...');
const verifyPatterns = [
    { pattern: /href="\/(?!portfolio)/g, description: 'absolute URLs without /portfolio prefix' },
    { pattern: /src="\/(?!portfolio)/g, description: 'asset URLs without /portfolio prefix' },
    { pattern: /http:\/\/localhost:4000/g, description: 'localhost URLs' },
    { pattern: /\/portfolio\/portfolio/g, description: 'double portfolio in URLs' },
    { pattern: /https:\/\/alvaropanizo\.github\.io\/(?!portfolio)/g, description: 'GitHub Pages URLs without portfolio prefix' }
];

let hasIssues = false;
verifyPatterns.forEach(({ pattern, description }) => {
    const matches = content.match(pattern);
    if (matches) {
        console.warn(`Warning: Found ${matches.length} ${description}:`);
        console.warn(matches);
        hasIssues = true;
    }
});

if (!hasIssues) {
    console.log('All URLs have been correctly modified!');
}

console.log('Build script completed successfully!'); 