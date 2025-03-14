const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    baseUrl: '/portfolio',
    sourceDir: '_site',
    patterns: [
        // Handle absolute paths in href and src attributes, but only if they start with /assets/
        { from: /(href|src)=["']\/assets\//g, to: '$1="/portfolio/assets/' },
        
        // Handle meta tags and canonical URLs
        { from: /(href|content)="http:\/\/localhost:4000/g, to: '$1="https://alvaropanizo.github.io/portfolio' },
        
        // Fix canonical URL (remove double portfolio)
        { from: /\/portfolio\/portfolio/g, to: '/portfolio' },
        
        // Handle any remaining absolute URLs to alvaropanizo.github.io
        { from: /https:\/\/alvaropanizo\.github\.io\/assets\//g, to: 'https://alvaropanizo.github.io/portfolio/assets/' }
    ]
};

// Function to process a single file
function processFile(filePath) {
    console.log('Processing file:', filePath);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply replacements
    config.patterns.forEach(pattern => {
        const matches = content.match(pattern.from);
        if (matches) {
            console.log(`Found ${matches.length} matches in ${filePath} for pattern: ${pattern.from}`);
            content = content.replace(pattern.from, pattern.to);
            modified = true;
        }
    });

    if (modified) {
        console.log('Writing modified file:', filePath);
        fs.writeFileSync(filePath, content, 'utf8');
    }

    return modified;
}

// Function to walk through directory
function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    let modifiedFiles = 0;

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            modifiedFiles += processDirectory(filePath);
        } else if (file.endsWith('.html')) {
            if (processFile(filePath)) {
                modifiedFiles++;
            }
        }
    });

    return modifiedFiles;
}

// Process all files
console.log('Starting to process files in:', config.sourceDir);
const totalModified = processDirectory(config.sourceDir);
console.log(`Build script completed successfully! Modified ${totalModified} files.`);

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