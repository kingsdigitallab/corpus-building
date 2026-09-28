import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xml2js from "xml2js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ZOTERO_API_BASE = "https://api.zotero.org/groups/382445/items";
const ZOTERO_CITATION_STYLE = "chicago-fullnote-bibliography";
const ZOTERO_CHUNK_SIZE = 50;
const REQUEST_DELAY_MS = 100;
const MAX_RETRIES = 3;
const RETRY_AFTER_FALLBACK_MS = 5000;
const DEFAULT_LANGUAGE = "english";
const LOCALE_DEFAULT = "en-GB";
const LOCALE_GERMAN = "de-DE";
const LOCALE_ITALIAN = "it-IT";
const LOCALE_FRENCH = "fr-FR";
const LOCALE_SPANISH = "es-ES";

/**
 * Extracts all Zotero data for inscriptions and saves it to a JSON file.
 * This script should be run before the main ETL process to avoid repeated API calls.
 * Items are fetched in batches of up to ZOTERO_CHUNK_SIZE keys per API request.
 */
async function extractAllZoteroData() {
  console.log("Starting Zotero data extraction...");

  let totalErrors = 0;

  // Read all XML inscription files to find Zotero references
  const inscriptionsDir = path.join(
    __dirname,
    "../../../data/raw/inscriptions",
  );

  try {
    const files = await fs.readdir(inscriptionsDir);
    const xmlFiles = files.filter((file) => file.endsWith(".xml"));

    console.log(
      `Found ${xmlFiles.length} XML files to process in ${inscriptionsDir}`,
    );

    // Collect all Zotero keys, preserving first-encountered order
    const zoteroKeys = [];
    const processedKeys = new Set();

    for (const file of xmlFiles) {
      try {
        const filePath = path.join(inscriptionsDir, file);
        const xmlContent = await fs.readFile(filePath, "utf8");

        // Parse XML to extract Zotero references
        const xml = await parseXML(xmlContent);
        if (!xml) continue;

        // Extract Zotero keys from the XML
        const keys = extractZoteroKeysFromXML(xml);

        for (const key of keys) {
          if (key && !processedKeys.has(key)) {
            processedKeys.add(key);
            zoteroKeys.push(key);
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
        totalErrors++;
      }
    }

    // Fetch all Zotero data in batches; unfetched keys are counted as errors
    const zoteroDataObject = await fetchZoteroDataBatch(zoteroKeys);
    const totalProcessed = Object.keys(zoteroDataObject).length;
    totalErrors += zoteroKeys.length - totalProcessed;

    // Save to JSON file
    const outputPath = path.join(
      __dirname,
      "../../../data/processed/zotero.json",
    );
    await fs.writeFile(outputPath, JSON.stringify(zoteroDataObject, null, 2));

    console.log("\nZotero data extraction completed!");
    console.log(`Total items processed: ${totalProcessed}`);
    console.log(`Total errors: ${totalErrors}`);
    console.log(`Output saved to: ${outputPath}`);
  } catch (error) {
    console.error("Error during Zotero data extraction:", error);
    process.exit(1);
  }
}

/**
 * Parses XML string using xml2js
 */
async function parseXML(
  xmlString,
  options = { explicitArray: false, mergeAttrs: true },
) {
  const parser = new xml2js.Parser(options);
  try {
    return await parser.parseStringPromise(xmlString);
  } catch (error) {
    console.error("Error parsing XML:", error);
    return null;
  }
}

/**
 * Extracts Zotero keys from parsed XML data
 */
function extractZoteroKeysFromXML(xml) {
  const keys = new Set();

  // Extract from edition author source
  const edition = xml.TEI?.text?.body?.div?.find(
    (div) => div.type === "edition",
  );
  if (edition?.source?.includes("zotero")) {
    const key = edition.source.split("/").at(-1);
    if (key) keys.add(key);
  }

  // Extract from bibliography ptr targets
  const bibliography = xml.TEI?.text?.body?.div?.find(
    (div) => div.type === "bibliography",
  )?.listBibl;
  if (bibliography) {
    const bibliographyArray = Array.isArray(bibliography)
      ? bibliography
      : [bibliography];

    for (const listBibl of bibliographyArray) {
      if (listBibl.bibl) {
        const biblArray = Array.isArray(listBibl.bibl)
          ? listBibl.bibl
          : [listBibl.bibl];

        for (const bibl of biblArray) {
          if (bibl.ptr?.target?.includes("zotero")) {
            const key = bibl.ptr.target.split("/").at(-1);
            if (key) keys.add(key);
          }
        }
      }
    }
  }

  return Array.from(keys);
}

/**
 * Waits for the given number of milliseconds. Returns a promise that
 * resolves once the delay has elapsed.
 */
function sleep(ms) {
  const ret = new Promise((resolve) => setTimeout(resolve, ms));
  return ret;
}

/**
 * Reads the retry delay in milliseconds from a 429 response's Retry-After
 * header (interpreted as seconds). Returns RETRY_AFTER_FALLBACK_MS when the
 * header is missing or cannot be parsed.
 */
function getRetryAfterMs(response) {
  let ret = RETRY_AFTER_FALLBACK_MS;
  const retryAfterSeconds = Number.parseInt(
    response.headers?.get?.("retry-after") ?? "",
    10,
  );
  if (Number.isFinite(retryAfterSeconds)) {
    ret = retryAfterSeconds * 1000;
  }
  return ret;
}

/**
 * Fetches a URL and retries on HTTP 429, pausing for the delay requested via
 * the Retry-After header. Returns the final response, which may still be a
 * 429 once MAX_RETRIES attempts have been exhausted.
 */
async function fetchWithRetry(url) {
  let ret;

  for (let attempt = 0; ; attempt++) {
    ret = await fetch(url);
    if (ret.status !== 429 || attempt >= MAX_RETRIES) break;
    const delayMs = getRetryAfterMs(ret);
    console.warn(
      `Rate limited by the Zotero API (429) for ${url}. Retrying in ${delayMs}ms...`,
    );
    await sleep(delayMs);
  }

  return ret;
}

/**
 * Maps a Zotero item language to a citation locale, defaulting to en-GB.
 */
function getLocale(language) {
  let ret = LOCALE_DEFAULT;
  const normalizedLanguage = language?.toLowerCase() || DEFAULT_LANGUAGE;

  if (
    normalizedLanguage.indexOf("ge") === 0 ||
    normalizedLanguage.indexOf("german") === 0
  ) {
    ret = LOCALE_GERMAN;
  } else if (
    normalizedLanguage.indexOf("it") === 0 ||
    normalizedLanguage.indexOf("italian") === 0
  ) {
    ret = LOCALE_ITALIAN;
  } else if (
    normalizedLanguage.indexOf("fr") === 0 ||
    normalizedLanguage.indexOf("french") === 0
  ) {
    ret = LOCALE_FRENCH;
  } else if (
    normalizedLanguage.indexOf("es") === 0 ||
    normalizedLanguage.indexOf("spanish") === 0
  ) {
    ret = LOCALE_SPANISH;
  }

  return ret;
}

/**
 * Maps a Zotero API item (with citation) to the record stored in zotero.json.
 */
function toZoteroRecord(item) {
  const ret = {
    title: item.data.title?.trim() || "",
    author:
      item.data?.creators
        .filter((creator) => creator.creatorType === "author")
        .map((creator) => creator?.lastName?.trim())
        .filter(Boolean)
        .join(", ") || "",
    date: item.data.date?.trim() || null,
    citation: item.citation.replace(".</span>", "</span>"),
    uri: item.links.alternate.href,
  };
  return ret;
}

/**
 * Fetches data from Zotero API for a given item key
 */
async function fetchZoteroData(itemKey) {
  let ret = null;

  if (!itemKey) return ret;

  try {
    // First, get the language to determine locale
    let url = `${ZOTERO_API_BASE}/${itemKey}?format=json&include=data`;

    const response = await fetchWithRetry(url);
    if (!response.ok) {
      console.warn(
        `Failed to fetch Zotero item ${itemKey}: ${response.status}`,
      );
    } else {
      const json = await response.json();
      const locale = getLocale(json.data.language);

      // Get the full citation data
      url = `${ZOTERO_API_BASE}/${itemKey}?format=json&include=citation,data&style=${ZOTERO_CITATION_STYLE}&linkwrap=1&locale=${locale}`;

      const citationResponse = await fetchWithRetry(url);
      if (!citationResponse.ok) {
        console.warn(
          `Failed to fetch citation for Zotero item ${itemKey}: ${citationResponse.status}`,
        );
      } else {
        const citationJson = await citationResponse.json();

        ret = toZoteroRecord(citationJson);

        console.log(`✓ Fetched data for Zotero item: ${itemKey}`);
      }
    }
  } catch (error) {
    console.error(`Error fetching Zotero data for ${itemKey}:`, error.message);
  }

  return ret;
}

/**
 * Fetches Zotero records for a chunk of item keys (at most ZOTERO_CHUNK_SIZE),
 * grouping the citation requests by locale. Keys that cannot be fetched at
 * batch level are retried individually. Returns an object mapping item key to
 * Zotero record.
 */
async function fetchZoteroDataChunk(chunk) {
  const ret = {};
  const fallbackKeys = [];

  try {
    const dataUrl = `${ZOTERO_API_BASE}?itemKey=${chunk.join(",")}&format=json&include=data`;
    const dataResponse = await fetchWithRetry(dataUrl);
    await sleep(REQUEST_DELAY_MS);
    if (!dataResponse.ok) {
      throw new Error(`status ${dataResponse.status}`);
    }

    const items = await dataResponse.json();
    const keysByLocale = {};
    const foundKeys = new Set(items.map((item) => item.key));

    for (const item of items) {
      const locale = getLocale(item.data.language);
      (keysByLocale[locale] ??= []).push(item.key);
    }

    // Keys absent from the response no longer exist in the Zotero library;
    // retry them individually to preserve the original per-item warnings
    fallbackKeys.push(...chunk.filter((key) => !foundKeys.has(key)));

    for (const [locale, localeKeys] of Object.entries(keysByLocale)) {
      try {
        const citationUrl = `${ZOTERO_API_BASE}?itemKey=${localeKeys.join(",")}&format=json&include=citation,data&style=${ZOTERO_CITATION_STYLE}&linkwrap=1&locale=${locale}`;
        const citationResponse = await fetchWithRetry(citationUrl);
        await sleep(REQUEST_DELAY_MS);
        if (!citationResponse.ok) {
          throw new Error(`status ${citationResponse.status}`);
        }

        const citationItems = await citationResponse.json();
        const mappedKeys = new Set();

        for (const item of citationItems) {
          try {
            ret[item.key] = toZoteroRecord(item);
            mappedKeys.add(item.key);
          } catch (error) {
            console.error(
              `Error mapping Zotero item ${item.key}:`,
              error.message,
            );
          }
        }

        fallbackKeys.push(...localeKeys.filter((key) => !mappedKeys.has(key)));
      } catch (error) {
        console.warn(
          `Failed to fetch Zotero citations for ${localeKeys.join(",")}:`,
          error.message,
        );
        fallbackKeys.push(...localeKeys);
      }
    }
  } catch (error) {
    console.warn(
      `Failed to fetch Zotero items ${chunk.join(",")}:`,
      error.message,
    );
    fallbackKeys.push(...chunk.filter((key) => !(key in ret)));
  }

  // Retry the keys that failed at batch level one by one
  for (const key of new Set(fallbackKeys)) {
    const record = await fetchZoteroData(key);
    if (record) {
      ret[key] = record;
    }
    await sleep(REQUEST_DELAY_MS);
  }

  return ret;
}

/**
 * Fetches Zotero data for many item keys, requesting up to ZOTERO_CHUNK_SIZE
 * items per API call instead of one call per item. Keys whose data cannot be
 * fetched are omitted. Returns an object mapping item key to Zotero record,
 * in input key order.
 */
async function fetchZoteroDataBatch(keys) {
  const ret = {};
  const records = {};
  const uniqueKeys = [...new Set(keys ?? [])];
  const totalChunks = Math.ceil(uniqueKeys.length / ZOTERO_CHUNK_SIZE);

  for (let i = 0; i < uniqueKeys.length; i += ZOTERO_CHUNK_SIZE) {
    const chunk = uniqueKeys.slice(i, i + ZOTERO_CHUNK_SIZE);
    const chunkRecords = await fetchZoteroDataChunk(chunk);
    Object.assign(records, chunkRecords);
    console.log(
      `✓ Fetched Zotero items ${Object.keys(records).length}/${uniqueKeys.length} (chunk ${i / ZOTERO_CHUNK_SIZE + 1}/${totalChunks})`,
    );
  }

  // Preserve the original key order in the resulting object
  for (const key of uniqueKeys) {
    if (records[key]) {
      ret[key] = records[key];
    }
  }

  return ret;
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  extractAllZoteroData();
}

export {
  extractAllZoteroData,
  extractZoteroKeysFromXML,
  fetchZoteroData,
  fetchZoteroDataBatch,
  getLocale,
  parseXML,
  toZoteroRecord,
};
