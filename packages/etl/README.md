# Corpus Building: ETL

An ETL (Extract, Transform, Load) package for processing
[EpiDoc](https://epidoc.stoa.org) [TEI](https://tei-c.org) XML files. It
extracts metadata from TEI XML documents, transforms them into HTML using XSLT
stylesheets, and generates JSON and HTML outputs for use in the
[web application](../../frontend/README.md).

## Source modules

| Module                  | Description                                                                                                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.js`              | Main entry point. Orchestrates the ETL pipeline: reads TEI XML files, transforms them to HTML via Saxon-JS, extracts metadata, and writes the processed output.                                                                                                     |
| `metadata.js`           | Extracts structured metadata (title, dates, places, provenance, bibliography, languages, etc.) from parsed TEI XML.                                                                                                                                                 |
| `zotero.js`             | Fetches bibliographic citation data from the [Zotero API](https://www.zotero.org/support/dev/web_api/v3/start) and saves it as a local JSON cache. Should be run before the main ETL process.                                                                       |
| `museums.js`            | Converts a museums CSV authority list into TEI XML format.                                                                                                                                                                                                          |
| `museums-json.js`       | Converts the TEI XML museums file into JSON for use in the frontend.                                                                                                                                                                                                |
| `petrography-json.js`   | Merges petrographic analysis CSVs from `data/petrography/` into an intermediate `data/processed/petrography.json` (one record per inscription with `type`, `subtype`, `ana`, `description` and whether credit should be added). Run before `petrography-import.js`. |
| `petrography-import.js` | Reads `petrography.json` and patches each inscription XML file: sets `@type`, `@subtype`, `@ana` on `<material>`, and inserts `<respStmt>` where applicable.                                                                                                        |

## Scripts

All scripts can be run from the **monorepo root** via `npm run` or directly
within this package.

| Root command               | Package command              | Description                                           |
| -------------------------- | ---------------------------- | ----------------------------------------------------- |
| `npm run etl`              | `npm run etl`                | Run the main ETL pipeline.                            |
| `npm run etl:sef`          | `npm run sef`                | Compile the XSLT stylesheet into a Saxon-JS SEF file. |
| `npm run etl:museums-json` | `npm run museums-json`       | Convert the museums TEI XML to JSON.                  |
| —                          | `npm run museums`            | Convert the museums CSV to TEI XML.                   |
| —                          | `npm run zotero`             | Fetch citation data from the Zotero API.              |
| —                          | `npm run petrography:json`   | Merge petrography CSVs into intermediate JSON.        |
| —                          | `npm run petrography:import` | Apply petrography JSON to inscription XML files.      |
| —                          | `npm run test`               | Run the unit tests.                                   |

### ETL options

The main ETL script accepts several command-line arguments (passed after `--`):

```sh
npm run etl -- --help
```

## Input / Output

| Direction | Path                     | Contents                                                            |
| --------- | ------------------------ | ------------------------------------------------------------------- |
| Input     | `data/raw/inscriptions/` | TEI XML inscription files (git submodule)                           |
| Input     | `data/raw/alists/`       | Authority lists (museums CSV/XML)                                   |
| Input     | `data/petrography/`      | Petrographic analysis CSVs                                          |
| Input     | `xslt/epidoc/`           | XSLT stylesheets (git submodule)                                    |
| Output    | `data/processed/`        | Generated JSON metadata, HTML fragments, Zotero cache, museums JSON |

## Dependencies

### Runtime

- [Saxon-JS](https://www.saxonica.com/saxon-js/) — XSLT 3.0 transformation
- [Cheerio](https://cheerio.js.org/) — HTML parsing and manipulation
- [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) — XML to
  JavaScript object conversion
- [yargs](https://yargs.js.org/) — Command-line argument parsing

### Development

- [Vitest](https://vitest.dev/) — Unit testing framework
- [csv-parse](https://csv.js.org/parse/) — CSV parsing (for museums and petrography conversion)

## Testing

Run the ETL unit tests from within this package:

```sh
npm test
```

Or from the monorepo root:

```sh
npm run test:etl
```

Generate a coverage report:

```sh
npx vitest run --coverage
```

Test files follow the `*.spec.js` naming convention alongside their source
modules.
