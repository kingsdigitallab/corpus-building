import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import SaxonJS from "saxon-js";
import { fileURLToPath, pathToFileURL } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { extractMetadata, parseXML } from "./metadata.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STYLESHEET_PATH = path.resolve(
  __dirname,
  "../../../",
  "xslt",
  "epidoc",
  "start-edition.sef.json",
);

// added this comment to test GH workflow trigger

let cachedStylesheet = null;

/**
 * Loads and caches the compiled XSLT stylesheet (SEF) once, returning the
 * parsed internal representation and its base URI so that SaxonJS can reuse
 * them across transforms without re-reading and re-parsing the SEF on every
 * call.
 *
 * @async
 * @function loadStylesheet
 * @returns {Promise<{stylesheetInternal: Object, stylesheetBaseURI: string}>} A promise that resolves to the cached stylesheet descriptor.
 * @throws {Error} If there's an error reading or parsing the stylesheet.
 */
async function loadStylesheet() {
  let ret = cachedStylesheet;
  if (!ret) {
    const sefText = await fs.readFile(STYLESHEET_PATH, "utf-8");
    ret = {
      stylesheetInternal: JSON.parse(sefText),
      stylesheetBaseURI: pathToFileURL(STYLESHEET_PATH).href,
    };
    cachedStylesheet = ret;
  }
  return ret;
}

/**
 * Transforms an XML string to HTML using an XSLT stylesheet.
 *
 * @async
 * @function transformToHtml
 * @param {string} filePath - The path to the XML file to be transformed.
 * @returns {Promise<string>} A promise that resolves to the transformed HTML content.
 * @throws {Error} If there's an error during the transformation process.
 */
async function transformToHtml(filePath) {
  const { stylesheetInternal, stylesheetBaseURI } = await loadStylesheet();

  const result = await SaxonJS.transform({
    stylesheetInternal,
    stylesheetBaseURI,
    sourceFileName: filePath,
    destination: "serialized",
  });

  const $ = cheerio.load(result.principalResult);

  const divs = $("body > div:not(#facsimile-images #handnote)")
    .map((i, div) => ({
      id: $(div).attr("id"),
      cls: $(div).attr("class"),
      html: $(div).html(),
    }))
    .get();

  const editions = $("div#editions > div")
    .map((i, div) => ({
      id: $(div).attr("id"),
      lang: $(div).attr("lang"),
      html: $(div).html().trim(),
    }))
    .get();

  const images = $("div#facsimile-images > a")
    .map((_, a) => ({
      image: $(a).attr("href"),
      thumb: $(a).find("img").attr("src"),
      title: $(a).find("img").attr("title"),
    }))
    .get();

  const handnote = $("div#handnote p")
    .first()
    .map((_, div) => ({
      id: $(div).attr("id"),
      html: $(div).html().trim(),
    }))
    .get();

  return {
    title: $("title").text(),
    body: $("body").html(),
    divs,
    editions,
    images,
    handnote,
  };
}

async function extractLemmas(html) {
  if (!html || typeof html !== "string") {
    throw new Error("HTML input must be a non-empty string");
  }

  try {
    const $ = cheerio.load(html);

    const result = {
      lemmas: [],
      text: [],
      html,
    };

    $("span").each((_, span) => {
      const text = $(span).attr("data-text");
      const lemma = $(span).attr("data-lemma");

      if (text) result.text.push(text.replace(/\s+/g, " ").trim());
      if (lemma) result.lemmas.push(lemma);
    });

    return result;
  } catch (error) {
    throw new Error(`Failed to extract lemmas: ${error.message}`);
  }
}

/**
 * Processes a single XML file, extracting metadata and/or transforming to HTML
 * based on the provided options.
 *
 * @async
 * @function processFile
 * @param {string} filePath - The path to the XML file to be processed.
 * @param {string} outputPath - The base output directory path where processed files will be saved.
 * @param {Object} [options={}] - An object containing processing options.
 * @param {boolean} [options.extractMetadata=true] - Whether to extract metadata from the XML file.
 * @param {boolean} [options.transformToHtml=true] - Whether to transform the XML file to HTML.
 * @returns {Promise<Object>} A promise that resolves to an object containing the processing results.
 * @property {string} file - The base name of the processed file (without extension).
 * @property {Object} [metadata] - The extracted metadata (if extractMetadata option is true).
 * @property {string} [htmlPath] - The path to the generated HTML file (if transformToHtml option is true).
 * @throws {Error} If there's an error reading the file or during processing.
 */
async function processFile(filePath, outputPath, options = {}) {
  const {
    extractMetadata: shouldExtractMetadata = true,
    transformToHtml: shouldTransformToHtml = true,
    extractLemmas: shouldExtractLemmas = true,
  } = options;
  const baseName = path.basename(filePath, ".xml");
  const xmlString = await fs.readFile(filePath, "utf-8");

  const metaOutputPath = path.join(outputPath, "metadata");
  const metaOutputFile = path.join(metaOutputPath, `${baseName}.json`);

  const htmlOutputPath = path.join(outputPath, "html");
  const htmlOutputFile = path.join(htmlOutputPath, `${baseName}.json`);

  const lemmasOutputPath = path.join(outputPath, "lemmas");
  const lemmasOutputFile = path.join(lemmasOutputPath, `${baseName}.json`);

  let result = {
    file: baseName,
  };
  let htmlResult = null;

  if (shouldExtractMetadata) {
    const metadata = await extractMetadata(xmlString);

    result = { ...result, ...metadata };

    await fs.writeFile(metaOutputFile, JSON.stringify(result, null, 2));
  }

  if (shouldTransformToHtml) {
    htmlResult = await transformToHtml(filePath, xmlString);

    await fs.writeFile(htmlOutputFile, JSON.stringify(htmlResult, null, 2));
  }

  if (shouldExtractLemmas) {
    const json =
      htmlResult ?? JSON.parse(await fs.readFile(htmlOutputFile, "utf-8"));

    try {
      const words = await extractLemmas(json.editions[1].html);
      result = { ...result, ...words };

      await fs.writeFile(lemmasOutputFile, JSON.stringify(words, null, 2));
    } catch (error) {
      console.error(
        `Error extracting lemmas for ${baseName}: ${error.message}`,
      );
    }
  }

  return result;
}

/**
 * Processes multiple TEI XML files in a given directory, extracting metadata
 * and/or transforming to HTML based on the provided options.
 *
 * @async
 * @function processTeiFiles
 * @param {string} inputPath - The path to the directory containing TEI XML files to be processed.
 * @param {string} outputPath - The path to the directory where processed files and metadata will be saved.
 * @param {Object} [options={}] - An object containing processing options.
 * @param {boolean} [options.extractMetadata] - Whether to extract metadata from the XML files.
 * @param {boolean} [options.transformToHtml] - Whether to transform the XML files to HTML.
 * @param {boolean} [options.extractLemmas] - Whether to extract lemmas from the XML files.
 * @param {boolean} [options.extractBibliography] - Whether to extract bibliography from the XML files.
 * @param {string} [options.inscriptionFilter] - Process inscriptions matching that pattern.
 * @returns {Promise<Array>} A promise that resolves to an array of objects, each containing the processing results for a single file.
 * @throws {Error} If there's an error reading the directory or processing files.
 */
async function processTeiFiles(inputPath, outputPath, options = {}) {
  const files = await fs.readdir(inputPath);
  const results = [];
  const lemmas = [];
  const bibliography = {};

  if (options.extractMetadata !== false) {
    await fs.mkdir(path.join(outputPath, "metadata"), { recursive: true });
  }
  if (options.transformToHtml !== false) {
    await fs.mkdir(path.join(outputPath, "html"), { recursive: true });
  }
  if (options.extractLemmas !== false) {
    await fs.mkdir(path.join(outputPath, "lemmas"), { recursive: true });
  }

  for (const file of files) {
    if (file.includes('ISic09')) {
      // GN: 22/05/2026, exclude those inscription files, out of CR research scope
      continue;
    }

    if (file.endsWith(".xml")) {
      if (
        options.inscriptionFilter &&
        !file.includes(options.inscriptionFilter)
      ) {
        continue;
      }

      const filePath = path.join(inputPath, file);
      try {
        const result = await processFile(filePath, outputPath, options);
        lemmas.push({
          file: result.file,
          lemmas: result.lemmas,
          text: result.text,
          html: result.html,
        });

        result.lemmas = undefined;
        result.text = undefined;

        // GN: keep it just for the export of EDR to CSV
        // result.editions = undefined;
        result.support = undefined;
        result.dimensions = undefined;
        result.provenanceFound = undefined;
        result.provenanceObserved = undefined;
        result.provenanceLost = undefined;
        result.graphics = undefined;

        if (result.repository && typeof result.repository === "object") {
          result.repository.museum = undefined;
          result.repository.repository = undefined;
        }

        const bibls =
          result?.bibliographyEdition?.bibl?.filter(
            (b) => b?.ptr?.target && b?.title,
          ) || [];

        if (bibls) {
          for (const bibl of bibls) {
            const key = bibl.ptr.target.split("/").at(-1);

            if (key) {
              if (!bibliography[key]) {
                bibliography[key] = {
                  key,
                  ...bibl,
                  inscriptions: [],
                };
              }

              bibliography[key]["inscriptions"].push(result.file);
            }
          }
        }

        result.bibliographyEdition = undefined;
        result.bibliographyDiscussion = undefined;
        result.citation = undefined;

        results.push(result);

        console.log(`Processed ${filePath} successfully.`);
      } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
      }
    }
  }

  if (options.extractMetadata) {
    const metadataOutputFile = path.join(outputPath, "corpus.json");
    await fs.writeFile(metadataOutputFile, JSON.stringify(results, null, 2));
  }

  if (options.extractLemmas) {
    const lemmasOutputFile = path.join(outputPath, "lemmas.json");
    await fs.writeFile(lemmasOutputFile, JSON.stringify(lemmas, null, 2));
  }

  if (options.extractBibliography) {
    const bibliographyArray = Object.values(bibliography).sort((a, b) =>
      a.title.localeCompare(b.title),
    );

    const bibliographyOutputFile = path.join(outputPath, "bibliography.json");
    await fs.writeFile(
      bibliographyOutputFile,
      JSON.stringify(bibliographyArray, null, 2),
    );
  }

  return results;
}

/**
 * The main function that orchestrates the ETL (Extract, Transform, Load) process
 * for TEI XML files.
 * It sets up command-line arguments, processes the files, and handles the overall
 * execution flow.
 *
 * @async
 * @function main
 * @throws {Error} If there's an error during the ETL process.
 */
async function main() {
  const argv = yargs(hideBin(process.argv))
    .option("input", {
      alias: "i",
      type: "string",
      description: "Input directory path",
      default: path.resolve(
        __dirname,
        "../../../",
        "data",
        "raw",
        "inscriptions",
      ),
    })
    .option("output", {
      alias: "o",
      type: "string",
      description: "Output directory path",
      default: path.resolve(__dirname, "../../../", "data", "processed"),
    })
    .option("metadata", {
      type: "boolean",
      description: "Extract metadata",
      default: true,
    })
    .option("html", {
      type: "boolean",
      description: "Transform to HTML",
      default: true,
    })
    .option("lemmas", {
      type: "boolean",
      description: "Extract lemmas",
      default: true,
    })
    .option("bibliography", {
      type: "boolean",
      description: "Extract bibliography",
      default: true,
    })
    .option("filter", {
      alias: "f",
      type: "string",
      description: "Pattern to filter which inscriptions to process",
      default: null,
    })
    .help()
    .alias("help", "h")
    .parse();

  const teiPath = argv.input;
  const outputPath = argv.output;
  await fs.mkdir(outputPath, { recursive: true });

  const options = {
    extractMetadata: argv.metadata,
    transformToHtml: argv.html,
    extractLemmas: argv.lemmas,
    extractBibliography: argv.bibliography,
    inscriptionFilter: argv.filter,
  };

  try {
    const results = await processTeiFiles(teiPath, outputPath, options);
    console.log("ETL process completed");
    console.log(`Processed ${results.length} files`);
  } catch (error) {
    console.error("ETL process failed:", error);
  }
}

// Only run if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractLemmas };
