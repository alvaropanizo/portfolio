const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    baseUrl: '/portfolio',
    sourceDir: '_site',
    patterns: [
        // Handle all absolute paths in href and src attributes
        { from: /(href|src)=["']\//g, to: '$1="/portfolio/' },
        
        // But fix double portfolio in asset paths
        { from: /\/portfolio\/portfolio\/assets\//g, to: '/portfolio/assets/' },
        
        // Handle meta tags and canonical URLs
        { from: /(href|content)="http:\/\/localhost:4000/g, to: '$1="https://alvaropanizo.github.io/portfolio' },
        
        // Fix canonical URL (remove double portfolio)
        { from: /\/portfolio\/portfolio/g, to: '/portfolio' },
        
        // Handle any remaining absolute URLs to alvaropanizo.github.io
        { from: /https:\/\/alvaropanizo\.github\.io\/assets\//g, to: 'https://alvaropanizo.github.io/portfolio/assets/' }
    ]
};

// Verification patterns
const verifyPatterns = [
    { pattern: /href="\/(?!portfolio)/g, description: 'absolute URLs without /portfolio prefix' },
    { pattern: /src="\/(?!portfolio)/g, description: 'asset URLs without /portfolio prefix' },
    { pattern: /http:\/\/localhost:4000/g, description: 'localhost URLs' },
    { pattern: /\/portfolio\/portfolio/g, description: 'double portfolio in URLs' },
    { pattern: /https:\/\/alvaropanizo\.github\.io\/(?!portfolio)/g, description: 'GitHub Pages URLs without portfolio prefix' }
];

// Function to verify a single file
function verifyFile(filePath) {
    console.log('Verifying file:', filePath);
    const content = fs.readFileSync(filePath, 'utf8');
    let hasIssues = false;

    verifyPatterns.forEach(({ pattern, description }) => {
        const matches = content.match(pattern);
        if (matches) {
            console.warn(`Warning: Found ${matches.length} ${description} in ${filePath}:`);
            console.warn(matches);
            hasIssues = true;
        }
    });

    return hasIssues;
}

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

// Function to verify all HTML files in directory
function verifyDirectory(dir) {
    const files = fs.readdirSync(dir);
    let hasIssues = false;

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            hasIssues = verifyDirectory(filePath) || hasIssues;
        } else if (file.endsWith('.html')) {
            hasIssues = verifyFile(filePath) || hasIssues;
        }
    });

    return hasIssues;
}

// Process all files
console.log('Starting to process files in:', config.sourceDir);
const totalModified = processDirectory(config.sourceDir);
console.log(`Build script completed successfully! Modified ${totalModified} files.`);

// Verify all files
console.log('\nVerifying all HTML files...');
const hasIssues = verifyDirectory(config.sourceDir);

if (!hasIssues) {
    console.log('All files have been verified and are correct!');
} else {
    console.error('Issues found during verification. Please check the warnings above.');
    process.exit(1);
} 