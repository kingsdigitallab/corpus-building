import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converts a museums CSV file to TEI XML format
 *
 * @async
 * @function convertMuseumsToTei
 * @param {string} inputPath - Path to the museums CSV file
 * @param {string} outputPath - Path where the TEI XML file should be saved
 * @returns {Promise<void>}
 */
export async function convertMuseumsToTei(inputPath, outputPath) {
  const csvContent = await fs.readFile(inputPath, "utf-8");

  const museums = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  let teiXml = `<?xml version="1.0" encoding="UTF-8"?>
<TEI xmlns="http://www.tei-c.org/ns/1.0" xml:lang="en">
    <teiHeader>
        <fileDesc>
            <titleStmt>
                <title>ISicily museums authority list</title>
            </titleStmt>
            <publicationStmt>
                <ab/>
            </publicationStmt>
            <sourceDesc>
                <ab/>
            </sourceDesc>
        </fileDesc>
        <profileDesc/>
    </teiHeader>
    <text>
        <body>
            <listOrg>`;

  for await (const museum of museums) {
    teiXml = `${teiXml}
                <org type="${museum.Type.toLowerCase()}">
                    <orgName ref="${museum.URI}">${museum.Name}</orgName>
                    <desc>${museum.Description}</desc>
                    <location>
                        <settlement>${museum.Town}</settlement>
                        <region>${museum.Province}</region>
                        <country>${museum.Country}</country>
                        <address><addrLine>${museum.Address.trim()}</addrLine></address>
                        <geo>${museum.Latitude}, ${museum.Longitude}</geo>
                    </location>${
                      museum["Pleiades or other URI"]
                        ? `
                    <idno type="Pleiades">${museum["Pleiades or other URI"]}</idno>
                `
                        : "\n               "
                    }</org>`;
  }

  teiXml = `${teiXml}
            </listOrg>
        </body>
    </text>
</TEI>`;

  await fs.writeFile(outputPath, teiXml);
}

/**
 * Command line interface for converting museums CSV to TEI XML
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
      "museums.csv"
    );

  const outputPath =
    process.argv[3] ||
    path.resolve(
      __dirname,
      "../../../",
      "data",
      "raw",
      "alists",
      "museums.xml"
    );

  try {
    await convertMuseumsToTei(inputPath, outputPath);
    console.log(
      `Successfully converted ${inputPath} to TEI XML at ${outputPath}`
    );
  } catch (error) {
    console.error("Error converting museums CSV to TEI XML:", error);
    process.exit(1);
  }
}

// Only run if this file is being run directly
if (import.meta.url === `file://${__filename}`) {
  main();
}
