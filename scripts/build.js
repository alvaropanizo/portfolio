const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    baseUrl: '/portfolio',
    patterns: [
        // HTML file patterns
        {
            files: ['_site/index.html'],
            replacements: [
                // Base paths
                { from: /(href|src)=["']\//g, to: '$1="/portfolio/' },
                // Full URLs
                { from: /https?:\/\/alvaropanizo\.github\.io(?!\/portfolio)/g, to: 'https://alvaropanizo.github.io/portfolio' },
                { from: /http:\/\/localhost:4000/g, to: 'https://alvaropanizo.github.io/portfolio' }
            ]
        },
        // CSS file patterns
        {
            files: ['_site/assets/css/theme.css', '_site/assets/css/basecamp.css'],
            replacements: [
                { from: /url\(['"]?\/assets\//g, to: 'url(\'/portfolio/assets/' }
            ]
        }
    ]
};

// Process each file type
config.patterns.forEach(pattern => {
    pattern.files.forEach(filePath => {
        if (!fs.existsSync(filePath)) {
            console.log(`Warning: File not found: ${filePath}`);
            return;
        }

        console.log(`Processing file: ${filePath}`);
        let content = fs.readFileSync(filePath, 'utf8');

        // Apply all replacements for this file type
        pattern.replacements.forEach(replacement => {
            const regex = replacement.from instanceof RegExp ? replacement.from : new RegExp(replacement.from, 'g');
            content = content.replace(regex, replacement.to);
        });

        // Write back the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    });
});

// Verify critical paths after processing
const criticalPaths = [
    '_site/assets/css/basecamp.css',
    '_site/assets/css/theme.css',
    '_site/assets/images/headshot.png',
    '_site/assets/js/navigation.js',
    '_site/assets/js/scrolltext.js'
];

console.log('\nVerifying critical assets:');
criticalPaths.forEach(assetPath => {
    if (fs.existsSync(assetPath)) {
        console.log(`✓ Found: ${assetPath}`);
    } else {
        console.log(`✗ Missing: ${assetPath}`);
    }
});

console.log('\nBuild script completed successfully!'); 