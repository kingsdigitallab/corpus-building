import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import xml2js from "xml2js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extracts all Zotero data for inscriptions and saves it to a JSON file.
 * This script should be run before the main ETL process to avoid repeated API calls.
 */
async function extractAllZoteroData() {
  console.log("Starting Zotero data extraction...");

  const zoteroDataMap = new Map();
  const processedKeys = new Set();
  let totalProcessed = 0;
  let totalErrors = 0;

  // Read all XML inscription files to find Zotero references
  const inscriptionsDir = path.join(
    __dirname,
    "../../../data/raw/inscriptions"
  );

  try {
    const files = await fs.readdir(inscriptionsDir);
    const xmlFiles = files.filter((file) => file.endsWith(".xml"));

    console.log(
      `Found ${xmlFiles.length} XML files to process in ${inscriptionsDir}`
    );

    for (const file of xmlFiles) {
      try {
        const filePath = path.join(inscriptionsDir, file);
        const xmlContent = await fs.readFile(filePath, "utf8");

        // Parse XML to extract Zotero references
        const xml = await parseXML(xmlContent);
        if (!xml) continue;

        // Extract Zotero keys from the XML
        const zoteroKeys = extractZoteroKeysFromXML(xml);

        for (const key of zoteroKeys) {
          if (key && !processedKeys.has(key)) {
            processedKeys.add(key);
            const zoteroData = await fetchZoteroData(key);
            if (zoteroData) {
              zoteroDataMap.set(key, zoteroData);
              totalProcessed++;
            } else {
              totalErrors++;
            }

            // Add a small delay to be respectful to the API
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
        totalErrors++;
      }
    }

    // Convert Map to object for JSON serialization
    const zoteroDataObject = Object.fromEntries(zoteroDataMap);

    // Save to JSON file
    const outputPath = path.join(
      __dirname,
      "../../../data/processed/zotero.json"
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
  options = { explicitArray: false, mergeAttrs: true }
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
    (div) => div.type === "edition"
  );
  if (edition?.source?.includes("zotero")) {
    const key = edition.source.split("/").at(-1);
    if (key) keys.add(key);
  }

  // Extract from bibliography ptr targets
  const bibliography = xml.TEI?.text?.body?.div?.find(
    (div) => div.type === "bibliography"
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
 * Fetches data from Zotero API for a given item key
 */
async function fetchZoteroData(itemKey) {
  if (!itemKey) return null;

  try {
    // First, get the language to determine locale
    let url = `https://api.zotero.org/groups/382445/items/${itemKey}?format=json&include=data`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        `Failed to fetch Zotero item ${itemKey}: ${response.status}`
      );
      return null;
    }

    const json = await response.json();
    const language = json.data.language?.toLowerCase() || "english";

    // Determine locale based on language
    let locale = "en-GB";
    if (language.indexOf("ge") === 0 || language.indexOf("german") === 0) {
      locale = "de-DE";
    } else if (
      language.indexOf("it") === 0 ||
      language.indexOf("italian") === 0
    ) {
      locale = "it-IT";
    } else if (
      language.indexOf("fr") === 0 ||
      language.indexOf("french") === 0
    ) {
      locale = "fr-FR";
    } else if (
      language.indexOf("es") === 0 ||
      language.indexOf("spanish") === 0
    ) {
      locale = "es-ES";
    }

    // Get the full citation data
    url = `https://api.zotero.org/groups/382445/items/${itemKey}?format=json&include=citation,data&style=chicago-fullnote-bibliography&linkwrap=1&locale=${locale}`;

    const citationResponse = await fetch(url);
    if (!citationResponse.ok) {
      console.warn(
        `Failed to fetch citation for Zotero item ${itemKey}: ${citationResponse.status}`
      );
      return null;
    }

    const citationJson = await citationResponse.json();

    const data = {
      title: citationJson.data.title?.trim() || "",
      date: citationJson.data.date?.trim() || null,
      citation: citationJson.citation.replace(".</span>", "</span>"),
      uri: citationJson.data.uri,
    };

    console.log(`✓ Fetched data for Zotero item: ${itemKey}`);
    return data;
  } catch (error) {
    console.error(`Error fetching Zotero data for ${itemKey}:`, error.message);
    return null;
  }
}

// Run the script if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  extractAllZoteroData();
}

export { extractAllZoteroData, fetchZoteroData };
