import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import xml2js from "xml2js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converts a TEI XML museums file to JSON format
 *
 * @async
 * @function convertMuseumsToJson
 * @param {string} inputPath - Path to the TEI XML file
 * @param {string} outputPath - Path where the JSON file should be saved
 * @returns {Promise<void>}
 */
export async function convertMuseumsToJson(inputPath, outputPath) {
  const xmlContent = await fs.readFile(inputPath, "utf-8");

  const xml = await xml2js.parseStringPromise(xmlContent);

  // Extract museums from TEI structure
  const museums = xml.TEI.text[0].body[0].listOrg[0].org.map((org) => {
    const museum = {
      type: org.$.type,
      name: org.orgName[0]._.replace(/\s{2,}/g, " "),
      uri: org.orgName[0].$.ref,
      description: org.desc ? org.desc[0]?.replace(/\s{2,}/g, " ") : "",
      location: {
        settlement: org.location[0].settlement[0]?.replace(/\s{2,}/g, " "),
        region: org.location[0].region[0]?.replace(/\s{2,}/g, " "),
        country: org.location[0].country[0]?.replace(/\s{2,}/g, " "),
        address: org.location[0].address[0].addrLine[0]?.replace(
          /\s{2,}/g,
          " "
        ),
        geo: {
          lat: parseFloat(org.location[0].geo[0].split(",")[0].trim()),
          lon: parseFloat(org.location[0].geo[0].split(",")[1].trim()),
        },
      },
    };

    // Add Pleiades ID if it exists
    if (org.idno) {
      museum.pleiades = org.idno[0]._;
    }

    return museum;
  });

  // Write formatted JSON to file
  await fs.writeFile(outputPath, JSON.stringify(museums, null, 2));
}

/**
 * Command line interface for converting museums TEI XML to JSON
 */
export async function main() {
  const inputPath =
    process.argv[2] ||
    path.resolve(
      __dirname,
      "../../../",
      "data",
      "raw",
      "alists",
      "museums.xml"
    );

  const outputPath =
    process.argv[3] ||
    path.resolve(__dirname, "../../../", "data", "processed", "museums.json");

  try {
    await convertMuseumsToJson(inputPath, outputPath);
    console.log(`Successfully converted ${inputPath} to JSON at ${outputPath}`);
  } catch (error) {
    console.error("Error converting museums TEI XML to JSON:", error);
    process.exit(1);
  }
}

// Only run if this file is being run directly
if (import.meta.url === `file://${__filename}`) {
  main();
}
