# Personal Portfolio Website

A static portfolio built with **Jekyll** and hosted on **GitHub Pages**. The homepage is **data-driven**: copy, links, images, and expandable “experience” carousels live in `_data/home.json` and are rendered with Liquid (`index.html` and `_includes/`).

For deeper build notes, JS/CSS hooks, and agent-oriented conventions, see [agent.md](agent.md).

## Technology Stack

- **Jekyll** (~4.x) — static generation, Liquid, `_data` files
- **Ruby** + **Bundler**
- **jekyll-theme-minimal** — listed in `_config.yml`; the custom homepage does not rely on theme layouts for its main layout
- **Plugins**: jekyll-feed, jekyll-seo-tag (and sitemap where enabled in CI)

## Local Development

**Prerequisites:** Ruby (2.6+), Bundler.

```bash
git clone [your-repo-url]
cd portfolio
bundle config set --local path 'vendor/bundle'
bundle install
```

**Serve locally** (empty `baseurl`, localhost URLs for canonical/OG):

```bash
bundle exec jekyll serve --livereload --config _config.yml,_config_local.yml
```

Open [http://localhost:4000](http://localhost:4000).

**Production-style build** (uses `baseurl: "/portfolio"` from `_config.yml` only):

```bash
bundle exec jekyll build
```

**Validate homepage data** (JSON Schema; requires [Node.js](https://nodejs.org/)):

```bash
./scripts/validate-home-data.sh
```

## Project Structure

```
portfolio/
├── agent.md                 # Agent/human architecture notes (excluded from site build)
├── README.md                # This file
├── _config.yml              # Production URL, baseurl, plugins
├── _config_local.yml        # Local overrides (merged when passed to jekyll serve)
├── _data/
│   └── home.json            # Homepage content — primary editorial file
├── schemas/
│   └── home.schema.json     # JSON Schema for home.json (excluded from Jekyll output)
├── scripts/
│   └── validate-home-data.sh
├── .vscode/
│   └── settings.json        # Maps home.json → schema (optional, for VS Code / Cursor)
├── _includes/
│   ├── home-head.html       # Homepage `<head>` (meta, fonts, CSS)
│   ├── home-scripts.html    # Homepage JS bundle (GSAP + feature scripts)
│   ├── carousel-card.html
│   ├── experience-block.html
│   └── icon-project-arrow.html
├── index.html               # Homepage shell (YAML front matter + Liquid)
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── certifications.html      # Other pages as needed
```

Collections (`experience`, `education`, `projects`) remain in `_config.yml` for optional future use; the **homepage** is intentionally curated from `_data/home.json` only.

---

## Homepage data structure (`_data/home.json`)

Jekyll exposes this file as `site.data.home` in Liquid. The root object has fixed top-level keys; nested shapes are documented below.

### Root keys

| Key | Purpose |
|-----|---------|
| `meta` | `<title>`, meta description, keywords, optional `og_image` |
| `header` | Hero: texture title, live-status label, current work, latest article, role lines + headshot, headline |
| `about` | Intro section paragraphs (scroll text) |
| `summary` | Three highlight lines + one large image (summary band) |
| `experience_section` | Section titles above the accordion |
| `experience_topics` | Exactly three pillar definitions; vocabulary for `cards[].topic_id` |
| `experiences` | Ordered list of expandable experience blocks, each with a carousel |
| `footer` | CTA lines, LinkedIn, CV link, about blurb |

### `meta`

| Field | Type | Notes |
|-------|------|--------|
| `title` | string | Page title |
| `description` | string | Meta description |
| `keywords` | string | Optional |
| `og_image` | string | Absolute or site-relative URL for Open Graph; may be empty |

### `header`

| Field | Type | Notes |
|-------|------|--------|
| `texture_title` | string | Large display name in hero |
| `live_status_label` | string | Initial label for `#live-status` (may be updated by JS) |
| `current_work` | object | `logo`, `logo_alt`, `text_html` (inline HTML allowed) |
| `latest_article` | object | `label`, `icon`, `icon_alt`, `url`, `title` |
| `roles` | object | `line_one`, `line_two`, `headshot.src`, `headshot.alt` |
| `headline_html` | string | HTML inside the subheading under the H1 |

### `about`

| Field | Type | Notes |
|-------|------|--------|
| `paragraphs_html` | string[] | Each item is output inside `<p class="h4 scrolltext">` |

### `summary`

| Field | Type | Notes |
|-------|------|--------|
| `lines_html` | string[] | Three lines (often with `<span class="text:lime">` wrappers) |
| `media` | object | `src`, `alt`, `class` for the large image |

### `experience_section`

| Field | Type |
|-------|------|
| `texture_title` | string |
| `heading` | string |

### `experience_topics` (three pillars)

Exactly **three** objects. The schema requires these `id` values (machine keys used on every carousel card as `topic_id`):

| `id` | Typical meaning |
|------|------------------|
| `leading_teams` | Leadership, teams, cross-functional delivery |
| `technical_depth` | Engineering, systems, data, architecture |
| `product_thinking` | Product management, discovery, strategy, roadmaps |

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | One of the three ids above (enforced by `schemas/home.schema.json`) |
| `label` | string | Full label; emitted on slides as `data-experience-topic-label` |
| `short_label` | string | Optional; reserved for compact UI (filters, chips) |

A card’s `topic_id` **does not have to match** the parent experience row: use it to mark which pillar the evidence best supports (e.g. a PSPO certificate under “Technical depth” can still use `product_thinking`).

### `experiences[]`

Each item is one accordion row plus its detail panel and carousel.

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Stable id, e.g. `"01"`. Drives `project-trigger-{{ id }}` and `project-details-{{ id }}` |
| `title` | string | Main headline in the collapsed row |
| `subtitle` | string | Secondary line (role/domain) |
| `body_paragraphs_html` | string[] | Each rendered as a `<p>` in the expanded body |
| `carousel_aria_label` | string | Accessible name for the highlights region |
| `cards` | array | Ordered carousel slides (discriminated union; see below) |

### `cards[]` — discriminated by `type`

Every card **must** include `"type": "<name>"` and **`"topic_id": "<pillar id>"`** (one of `experience_topics[].id`). Templates live in `_includes/carousel-card.html`.

Rendered slides include:

- `data-experience-topic="<topic_id>"`
- `data-experience-topic-label="<label from experience_topics>"` when a match exists
- CSS class `project-details-carousel__slide--topic-<topic_id>` (e.g. `...--topic-leading_teams`)

| `type` | Required fields | Purpose |
|--------|-----------------|--------|
| `photo` | `topic_id`, `image`, `image_alt`, `caption_html` | Image + footer caption |
| `general` | `topic_id`, `image`, `image_alt`, `body_html` | Same layout as photo; use when you want a distinct semantic in data only |
| `article` | `topic_id`, `url`, `title`, `thumbnail` | Optional `image_alt` (defaults to `title`) |
| `quote` | `topic_id`, `icon`, `quote_html`, `attribution_html` | Testimonial; `icon` is a Material Symbols ligature name |
| `certificate` | `topic_id`, `mark_image`, `mark_alt`, `title_html`, `issuer_html` | Badge / credential card |
| `video` | `topic_id`, `embed_url`, `iframe_title`, `caption_html` | `embed_url` is the full iframe `src` (prefer YouTube embed URLs) |

Adding a new type: extend `_includes/carousel-card.html`, add a matching `$defs` entry and `oneOf` branch in `schemas/home.schema.json`, and update this file and [agent.md](agent.md).

### `footer`

| Field | Type | Notes |
|-------|------|--------|
| `cta_lines_html` | string[] | CTA paragraphs |
| `linkedin_url` | string | Full URL |
| `cv_href` | string | Path under site root, e.g. `/assets/files/cv-alvaropanizo.pdf` |
| `about_title` | string | Eyebrow above footer about text |
| `about_body_html` | string | Plain or inline HTML for the about paragraph |

### Asset paths

Use **root-relative** paths in JSON (e.g. `/assets/images/...`). Jekyll’s `relative_url` filter prepends `baseurl` for GitHub Pages.

---

## JSON Schema (`schemas/home.schema.json`)

The file [schemas/home.schema.json](schemas/home.schema.json) is the **machine-readable contract** for `_data/home.json` (draft **2020-12**). It documents required keys, the three `experience_topics` entries, and a **`oneOf`** over carousel card shapes keyed by `type`. Every card type requires **`topic_id`** aligned with `$defs/ExperienceTopicId`.

**Local validation** (same command as CI):

```bash
./scripts/validate-home-data.sh
```

This runs `npx ajv-cli@5 validate … --spec=draft2020`. URI `format` is intentionally omitted so validation works without extra AJV format plugins.

**Editor integration:** [.vscode/settings.json](.vscode/settings.json) maps `_data/home.json` to the schema for autocomplete and inline errors.

**When you evolve the model**

1. Edit `_data/home.json` and **update the schema in the same PR** (`schemas/home.schema.json`).
2. If you add a fourth pillar, extend `$defs/ExperienceTopicId` and relax/adjust the `experience_topics` array rules (today: `minItems`/`maxItems`/`contains` for the three ids).
3. Refresh the tables in this README and [agent.md](agent.md).

Quick JSON syntax-only check: `python3 -m json.tool _data/home.json`.

## Deployment

Push to the branch configured for GitHub Pages (see `.github/workflows/jekyll.yml` if present). Ensure production `url` and `baseurl` in `_config.yml` match your Pages URL.

## License

This project is open source and available under the [MIT License](LICENSE).
