import * as cheerio from "cheerio";
import fs from "fs/promises";
import path from "path";
import SaxonJS from "saxon-js";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { extractMetadata } from "./metadata.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const xsltPath = path.resolve(
    __dirname,
    "../../../",
    "xslt",
    "epidoc",
    "start-edition.sef.json"
  );

  const result = await SaxonJS.transform({
    stylesheetLocation: xsltPath,
    sourceFileName: filePath,
    destination: "serialized",
  });

  const $ = cheerio.load(result.principalResult);

  const divs = $("body > div:not(#facsimile-images)")
    .map((i, div) => ({
      id: $(div).attr("id"),
      cls: $(div).attr("class"),
      html: $(div).html(),
    }))
    .get();

  const images = $("div#facsimile-images > a")
    .map((i, a) => ({
      image: $(a).attr("href"),
      thumb: $(a).find("img").attr("src"),
      title: $(a).find("img").attr("title"),
    }))
    .get();

  return {
    title: $("title").text(),
    body: $("body").html(),
    divs,
    images,
  };
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
  } = options;
  const baseName = path.basename(filePath, ".xml");
  const xmlString = await fs.readFile(filePath, "utf-8");

  const metaOutputPath = path.join(outputPath, "metadata");
  const metaOutputFile = path.join(metaOutputPath, `${baseName}.json`);

  const htmlOutputPath = path.join(outputPath, "html");
  const htmlOutputFile = path.join(htmlOutputPath, `${baseName}.json`);

  let result = {
    file: baseName,
  };

  if (shouldExtractMetadata) {
    const metadata = await extractMetadata(xmlString);

    result = { ...result, ...metadata };

    await fs.mkdir(metaOutputPath, { recursive: true });
    await fs.writeFile(metaOutputFile, JSON.stringify(result, null, 2));
  }

  if (shouldTransformToHtml) {
    const html = await transformToHtml(filePath, xmlString);

    await fs.mkdir(htmlOutputPath, { recursive: true });
    await fs.writeFile(htmlOutputFile, JSON.stringify(html, null, 2));
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
 * @returns {Promise<Array>} A promise that resolves to an array of objects, each containing the processing results for a single file.
 * @throws {Error} If there's an error reading the directory or processing files.
 */
async function processTeiFiles(inputPath, outputPath, options = {}) {
  const files = await fs.readdir(inputPath);
  const results = [];

  for (const file of files) {
    if (file.endsWith(".xml")) {
      const filePath = path.join(inputPath, file);
      try {
        const result = await processFile(filePath, outputPath, options);

        delete result.editions;
        delete result.support;
        delete result.dimensions;
        delete result.handNote;
        delete result.provenanceFound;
        delete result.provenanceObserved;
        delete result.provenanceLost;
        delete result.graphics;
        delete result?.repository?.museum;
        delete result.bibliographyEdition;
        delete result.bibliographyDiscussion;
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
        "inscriptions"
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
    .help()
    .alias("help", "h")
    .parse();

  const teiPath = argv.input;
  const outputPath = argv.output;
  await fs.mkdir(outputPath, { recursive: true });

  const options = {
    extractMetadata: argv.metadata,
    transformToHtml: argv.html,
  };

  try {
    const results = await processTeiFiles(teiPath, outputPath, options);
    console.log("ETL process completed");
    console.log(`Processed ${results.length} files`);
  } catch (error) {
    console.error("ETL process failed:", error);
  }
}

main();
