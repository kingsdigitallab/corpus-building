# Corpus Building: Web Application

A [SvelteKit](https://kit.svelte.dev) static site for browsing, searching, and
visualising the [I.Sicily](https://isicily.org) inscription corpus.

## Key features

- **Search and faceted browsing** — full-text search
  ([FlexSearch](https://github.com/nicxterra/flexsearch)) with faceted
  filtering ([ItemsJS](https://github.com/itemsjs/itemsjs))
- **Interactive map** — provenance map with clustering
  ([MapLibre GL](https://maplibre.org/) /
  [svelte-maplibre](https://github.com/dimfeld/svelte-maplibre))
- **Data visualisations** — charts and graphs
  ([Unovis](https://unovis.dev/))
- **Deep-zoom images** — high-resolution image viewer
  ([OpenSeadragon](https://openseadragon.github.io/))
- **Markdown content pages** — static editorial pages
  ([mdsvex](https://mdsvex.pngwn.io/))
- **CSV downloads** — export inscription data as CSV

## Project structure

```
frontend/
├── src/
│   ├── data/           # Processed data imported from the ETL output
│   ├── lib/
│   │   ├── assets/     # Static assets (images, etc.)
│   │   ├── components/ # Svelte components
│   │   ├── mdsvex/     # mdsvex configuration
│   │   ├── utils/      # Helper utilities (download, format, fuzzy search)
│   │   ├── config.js   # App-wide configuration (facets, fields, etc.)
│   │   └── footer.js   # Footer configuration
│   ├── pages/          # Markdown content pages
│   └── routes/         # SvelteKit routes
└── static/             # Static files (fonts, manifest, etc.)
```

## Development

Install dependencies and start the development server:

```sh
npm run dev
```

The site will be available at http://localhost:5173/.

## Building

Create a production build:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Testing

The frontend uses two layers of testing:

1. **End-to-end and Accessibility** ([Playwright](https://playwright.dev/)): Smoke tests for all routes and Axe accessibility scans.
2. **Unit Tests** ([Vitest](https://vitest.dev/)): Tests for pure functions and pure utilities.

Run all frontend tests:

```sh
npm test
```

Run integration/accessibility tests only:

```sh
npm run test:integration
```

Run unit tests only:

```sh
npm run test:unit
```

_(Note: Use `npm run test:watch` to run unit tests in interactive watch mode during development)._

## Adding content

Static pages are added to the site via
[markdown files](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax).
Markdown support is implemented using [mdsvex](https://mdsvex.pngwn.io/).

Pages are added by creating a new markdown file in the
[`src/pages/`](src/pages/) directory. Nested pages are supported by creating
subdirectories.

The page URL mirrors the file structure. For example:

- `src/pages/about.md` → `/about`
- `src/pages/about/periods.md` → `/about/periods`

## Dependencies

### Runtime

| Package                                                       | Purpose                           |
| ------------------------------------------------------------- | --------------------------------- |
| [@unovis/svelte](https://unovis.dev/)                         | Data visualisation components     |
| [bits-ui](https://www.bits-ui.com/)                           | Headless UI primitives            |
| [flexsearch](https://github.com/nicxterra/flexsearch)         | Full-text search                  |
| [itemsjs](https://github.com/itemsjs/itemsjs)                 | Faceted search/filtering          |
| [jszip](https://stuk.github.io/jszip/)                        | ZIP file generation for downloads |
| [lucide-svelte](https://lucide.dev/)                          | Icon library                      |
| [maplibre-gl](https://maplibre.org/)                          | WebGL map rendering               |
| [open-props](https://open-props.style/)                       | CSS custom properties             |
| [openseadragon](https://openseadragon.github.io/)             | Deep-zoom image viewer            |
| [svelte-maplibre](https://github.com/dimfeld/svelte-maplibre) | Svelte bindings for MapLibre      |

### Development

| Package                                                          | Purpose                     |
| ---------------------------------------------------------------- | --------------------------- |
| [@sveltejs/kit](https://kit.svelte.dev/)                         | Application framework       |
| [Playwright](https://playwright.dev/)                            | Integration testing         |
| [Vitest](https://vitest.dev/)                                    | Unit testing                |
| [mdsvex](https://mdsvex.pngwn.io/)                               | Markdown in Svelte          |
| [Prettier](https://prettier.io/) / [ESLint](https://eslint.org/) | Code formatting and linting |
