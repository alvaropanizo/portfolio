# Portfolio site — agent guide

Single source of truth for how this Jekyll portfolio is structured, how content is edited, and how to extend it without duplicating markup.

## Purpose

- **Personal portfolio** for Alvaro Panizo: hero, intro, summary band, expandable “Experience & core values” blocks with carousels, footer.
- **Goal**: All *copy, links, images, and carousel items* live in structured data (`_data/`). Pages only **layout + Liquid**; new experiences or cards are added by editing data and, only if needed, small include templates.

## Tech stack

| Piece | Role |
|--------|------|
| **Jekyll** (~4.x) | Static build, Liquid, `_data` files |
| **GitHub Pages** | Hosting (`baseurl` in `_config.yml` is `/portfolio` for project pages) |
| **CSS** | `assets/css/basecamp.css`, `assets/css/theme.css` (utility-style classes) |
| **JS** | `scrolltext.js`, `scrollimage.js`, `summaryblend.js`, `projects-accordion.js`, `project-details-carousel.js`, `live-status.js` (loaded via `_includes/home-scripts.html`) |
| **GSAP** | Loaded from CDN on the homepage for scroll animations |
| **JSON Schema** | `schemas/home.schema.json` (draft 2020-12) validates `_data/home.json`; CI runs `ajv-cli` |

## Commands

```bash
cd portfolio
bundle config set --local path 'vendor/bundle'   # once per clone
bundle install
./scripts/validate-home-data.sh   # requires Node.js — validates _data/home.json
bundle exec jekyll serve --livereload --config _config.yml,_config_local.yml
```

Use `_config_local.yml` when you need overrides (for example `url: http://localhost:4000` and `baseurl: ""`). Production build uses `_config.yml` only (see `.github/workflows/jekyll.yml` if present).

## Repository layout (relevant paths)

```
portfolio/
├── agent.md                 # This file — keep updated when architecture changes
├── README.md                # Human setup; may lag agent.md slightly
├── _config.yml              # Site URL, baseurl, plugins, collections (`agent.md` is excluded from `_site`)
├── _config_local.yml        # Local overrides (optional)
├── _data/
│   └── home.json            # Homepage content model (primary editable file)
├── schemas/
│   └── home.schema.json     # JSON Schema for home.json (excluded from Jekyll output)
├── scripts/
│   └── validate-home-data.sh # Optional local check (npx ajv-cli)
├── _includes/               # Liquid fragments: `home-head.html`, `home-scripts.html`, carousel, experience block
├── index.html               # Homepage shell; must have YAML front matter for Liquid
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── certifications.html      # Other pages as needed
```

**Note**: `jekyll-theme-minimal` is listed in `_config.yml`; the custom homepage is largely **standalone HTML + assets**. Do not assume theme layouts drive the home page.

`theme.css` still contains **nav panel** rules (`.nav:bar`, `.nav:panel`, etc.) for a layout that is not used on the current single-page home. There is no `navigation.js` in the repo anymore; if you add a global nav again, reintroduce a small script or inline handler for `#nav:panel:toggle`.

## Homepage information architecture

The page is composed of these **regions** (map 1:1 to keys under `_data/home.json` where applicable):

1. **Meta** (`meta`) — `<title>`, description, canonical hint, social preview fields.
2. **Hero / header** (`header`) — Large texture name, “live” status strip (also wired to `live-status.js`), **current work** tag (logo + line of text), **latest article** tag (icon + link + title).
3. **Role lines + headshot** (`header.roles`) — Two position titles (left / right of photo) and profile image + alt.
4. **Headline** (`header.headline_html`) — Short HTML line under the hero grid (supports inline spans/classes).
5. **About** (`about.paragraphs_html`) — Scroll-text intro block; each item is an HTML string (paragraph).
6. **Summary band** (`summary`) — Three short “flying” concept lines + one large image (scroll-driven effects via existing JS).
7. **Section title** (`experience_section`) — Texture title + main H2 for “Experience & core values”.
8. **Experience topics** (`experience_topics`) — Exactly three pillar definitions (`id`, `label`, optional `short_label`). Stable `id` values are the vocabulary for tagging carousel cards (`topic_id`). Cards may reference any pillar regardless of which experience row they appear under (cross-cutting highlights).
9. **Experiences** (`experiences`) — Ordered list of **expandable sections** (accordion + carousel). Each has: number label, title, subtitle line, body paragraphs, carousel aria-label, **cards** (each card includes `topic_id`).
10. **Footer** (`footer`) — CTA copy, LinkedIn URL, CV path, “About” blurb.

## Experience block structure (repeated)

Each entry in `experiences[]` shares the same shape:

| Field | Purpose |
|--------|---------|
| `id` | Stable string for DOM ids, e.g. `"01"` → `project-trigger-01`, `project-details-01` |
| `title` | Main H2 in the collapsed row |
| `subtitle` | Secondary line (role / domain) |
| `body_paragraphs_html` | Array of HTML strings; each wrapped in `<p>` by the template |
| `carousel_aria_label` | Accessible name for the highlights carousel |
| `cards` | Ordered list of **typed** carousel items (see below); every card requires `topic_id` |

## Experience pillars (`experience_topics`)

- **Length**: exactly three entries; schema enforces presence of ids `leading_teams`, `technical_depth`, and `product_thinking`.
- **Fields**: `id` (stable machine key), `label` (human-readable, used on slides as `data-experience-topic-label`), optional `short_label` for future UI.
- **Adding a fourth pillar later**: extend `ExperienceTopicId` enum and `experience_topics` constraints in `schemas/home.schema.json`, add the new object to `experience_topics` in JSON, then use the new `topic_id` on cards.

## Carousel card types (`cards[]`)

Each card has `type` (string) and **`topic_id`** (must match one of `experience_topics[].id`). Supported types:

| `type` | Use case | Main fields |
|--------|-----------|-------------|
| `photo` | Image + caption | `topic_id`, `image`, `image_alt`, `caption_html` |
| `video` | Embedded video + caption | `topic_id`, `embed_url` (full iframe `src`, preferably YouTube embed URL), `iframe_title`, `caption_html` |
| `article` | Article / project link with thumbnail | `topic_id`, `url`, `title`, `thumbnail` (image URL), `image_alt` (optional) |
| `quote` | Testimonial | `topic_id`, `quote_html`, `attribution_html`, `icon` (Material Symbols ligature name, e.g. `format_quote`) |
| `certificate` | Credential / badge | `topic_id`, `mark_image`, `mark_alt`, `title_html`, `issuer_html` |
| `general` | Image + freeform description | `topic_id`, `image`, `image_alt`, `body_html` (same presentation as `photo`; use when semantics differ in data only) |

Rendered slides expose **`data-experience-topic`**, optional **`data-experience-topic-label`**, and a class **`project-details-carousel__slide--topic-<topic_id>`** for filtering or styling by pillar.

**Extending**: Add a new `type` by branching in `_includes/carousel-card.html`, add a `$defs` branch and `oneOf` arm in `schemas/home.schema.json`, and document the field schema here. Prefer reusing existing CSS classes (`project-details-canvas-card`, `project-details-canvas-quote-card`, etc.) so JS and styling keep working.

## IDs, accessibility, and JS contracts

- **Accordion**: Rows use `.project:trigger`, `.project:details`, `aria-expanded`, `aria-controls`, `id`/`id` pairs. Implemented in `assets/js/projects-accordion.js` — **do not rename** these hooks without updating the script.
- **Carousel**: Wrapper `[data-project-carousel]`, slides `[data-carousel-slide]`, prev/next `[data-carousel-prev]` / `[data-carousel-next]`, iframes `[data-carousel-iframe]`. Optional pillar hooks: `[data-experience-topic]`, `[data-experience-topic-label]`. See `assets/js/project-details-carousel.js`.
- **Live clock**: `#live-status` / `.status-cet` — `assets/js/live-status.js`.

## URL and asset paths

- Prefer **root-relative** paths in JSON: `/assets/images/...`, `/assets/js/...` so the site works with `baseurl` on GitHub Pages.
- When adding images, place files under `assets/images/` (or subfolders) and reference them from `_data/home.json`.

## Editorial workflow (for humans and agents)

1. Open `_data/home.json`.
2. Edit strings or arrays; add an object to `experiences` or `cards` following an existing entry as a template.
3. Run `./scripts/validate-home-data.sh` (or rely on CI) so `home.json` matches `schemas/home.schema.json`.
4. Run `bundle exec jekyll build` or `serve` and spot-check the home page.
5. If a **new card type** is required, update `_includes/carousel-card.html`, `schemas/home.schema.json`, and this document in the same change.

## Quality checks

- **Schema**: `./scripts/validate-home-data.sh` (Node.js + npx `ajv-cli@5`, draft 2020-12).
- **Build**: `bundle exec jekyll build` (fix Liquid errors).
- **Syntax**: `python3 -m json.tool _data/home.json` for quick JSON well-formedness.
- **Editor**: `.vscode/settings.json` maps `_data/home.json` → `schemas/home.schema.json` for completions and diagnostics.

## Relationship to collections (`_config.yml`)

`_config.yml` defines collections (`experience`, `education`, `projects`). The **homepage** is intentionally driven by **`_data/home.json`** for one-file editing and a fixed layout. Collections can be used for future pages or migration; avoid duplicating the same content in both places without a clear split (e.g. collections for detail pages, `_data/home.json` for curated home highlights).

## Design intent

- **DRY markup**: One Liquid partial per card type and one per experience block.
- **Predictable growth**: New “experience” row = new JSON object + no HTML copy-paste.
- **Stable presentation**: JSON holds content; CSS class names stay in templates so the visual system does not drift.
