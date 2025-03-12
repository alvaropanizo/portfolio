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
                { from: 'href="/', to: 'href="/portfolio/' },
                { from: 'src="/', to: 'src="/portfolio/' },
                { from: 'href="http://localhost:4000"', to: 'href="https://alvaropanizo.github.io/portfolio"' },
                { from: 'content="http://localhost:4000"', to: 'content="https://alvaropanizo.github.io/portfolio"' }
            ]
        },
        // CSS file patterns
        {
            files: ['_site/assets/css/theme.css', '_site/assets/css/basecamp.css'],
            replacements: [
                { from: 'url\\([\'"]/assets/', to: 'url(\'/portfolio/assets/' },
                { from: 'url\\(/assets/', to: 'url(/portfolio/assets/' }
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
            content = content.replace(new RegExp(replacement.from, 'g'), replacement.to);
        });

        // Write back the file
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    });
});

console.log('Build script completed successfully!'); 