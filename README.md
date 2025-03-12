# Personal Portfolio Website

A modern, responsive portfolio website built with Jekyll and hosted on GitHub Pages.

## Technology Stack

- **Jekyll** (v4.3.2) - Static site generator
- **Ruby** - Programming language required for Jekyll
- **jekyll-theme-minimal** (v0.2.0) - Clean, lightweight Jekyll theme
- **Bundler** - Dependency management

### Jekyll Plugins
- jekyll-feed - For RSS feed generation
- jekyll-seo-tag - For better SEO optimization
- jekyll-sitemap - For automatic sitemap generation

## Local Development Setup

1. **Prerequisites**
   - Ruby (2.6.0 or higher)
   - Bundler (package manager)

2. **Installation**
   ```bash
   # Clone the repository
   git clone [your-repo-url]
   cd portfolio

   # Install dependencies locally
   bundle config set --local path 'vendor/bundle'
   bundle install
   ```

3. **Running Locally**
   ```bash
   # Start the development server with live reload
   bundle exec jekyll serve --livereload
   ```
   The site will be available at http://localhost:4000

4. **Development Notes**
   - The site will automatically reload when you make changes
   - Content can be written in Markdown or HTML
   - Configuration is managed in `_config.yml`
   - Theme customization can be done through `assets/css/style.scss`

## Project Structure

```
portfolio/
├── _config.yml        # Site configuration
├── _posts/           # Blog posts
├── _experience/      # Experience entries
├── _education/       # Education entries
├── _projects/        # Project entries
├── assets/          # Static files
│   ├── css/         # Custom CSS styles
│   └── img/         # Images including logo
└── index.md         # Homepage
```

## Theme Customization

The site uses the jekyll-theme-minimal theme, which provides:
- Clean, minimalist design
- Sidebar with logo and navigation
- Responsive layout
- Easy customization through `_config.yml` settings:
  - `logo`: Path to your logo image
  - `show_downloads`: Toggle download buttons
  - `google_analytics`: Analytics tracking ID (optional)

## Deployment

This site is configured to deploy on GitHub Pages. Simply push to the main branch of your GitHub repository named `username.github.io` to deploy.

## License

This project is open source and available under the [MIT License](LICENSE). 