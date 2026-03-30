import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../../data");

const COCCATO_RESP_STMT = `<respStmt><name xml:id="Coccato" ref="https://orcid.org/0000-0002-6641-2820">Alessia Coccato</name><resp>Petrographic observation and analysis</resp></respStmt>`;

/**
 * Update the attributes on the <material> opening tag.
 * Replaces @ana (always), and adds/replaces @type, @subtype, @resp.
 *
 * @param {string} xml
 * @param {{ type: string, subtype: string, ana: string, addCoccatoResp: boolean }} entry
 * @returns {string}
 */
export function updateMaterialElement(xml, entry) {
  // Match the opening <material ...> tag, possibly spanning a line
  const materialTagRegex = /<material(\s[^>]*)>/;
  const match = xml.match(materialTagRegex);
  if (!match) return xml;

  let attrs = match[1];

  // Strip existing @ana, @type, @subtype, @resp so we can rewrite them cleanly
  attrs = attrs.replace(/\s+ana="[^"]*"/g, "");
  attrs = attrs.replace(/\s+type="[^"]*"/g, "");
  attrs = attrs.replace(/\s+subtype="[^"]*"/g, "");
  attrs = attrs.replace(/\s+resp="[^"]*"/g, "");

  // Build the new leading attributes (ana first, matching EpiDoc conventions)
  let leading = ` ana="${entry.ana}"`;
  leading += ` type="${entry.type}"`;
  leading += ` subtype="${entry.subtype}"`;
  if (entry.addCoccatoResp) leading += ` resp="#Coccato"`;

  const newTag = `<material${leading}${attrs}>`;
  return xml.replace(materialTagRegex, newTag);
}

/**
 * Insert Coccato's <respStmt> before </titleStmt> if not already present.
 *
 * @param {string} xml
 * @returns {string}
 */
export function addCoccatoRespStmt(xml) {
  if (xml.includes('xml:id="Coccato"')) return xml;
  return xml.replace(
    "</titleStmt>",
    `${COCCATO_RESP_STMT}\n            </titleStmt>`,
  );
}

/**
 * Replace the text content of the <material> element.
 *
 * @param {string} xml
 * @param {string} description
 * @returns {string}
 */
export function updateMaterialContent(xml, description) {
  return xml.replace(
    /(<material\s[^>]*>)[\s\S]*?(<\/material>)/,
    `$1${description}$2`,
  );
}

/**
 * Build the TEI XML fragment for a provenance <place> element.
 * The fragment is intended to appear inside <material>, after the text description.
 *
 * @param {{ placeName: string, coordinates: string, radius: string | null, uri: string }} provenance
 * @returns {string}
 */
export function buildProvenanceXml(provenance) {
  const precision = provenance.radius
    ? `\n  <precision match="preceding-sibling::geo" n="${provenance.radius}"/>`
    : "";
  return `\n<placeName type="provenance">\n <ref target="${provenance.uri}">${provenance.placeName}</ref>\n <location>\n  <geo>${provenance.coordinates}</geo>${precision}\n </location>\n</placeName>`;
}

/**
 * Apply all petrography changes to an XML string.
 *
 * @param {string} xml
 * @param {{ type: string, subtype: string, ana: string, addCoccatoResp: boolean, description: string | null, provenance?: object | null }} entry
 * @returns {string}
 */
export function applyPetrographyImport(xml, entry) {
  let result = updateMaterialElement(xml, entry);
  if (entry.description != null) {
    const content = entry.provenance
      ? entry.description + buildProvenanceXml(entry.provenance)
      : entry.description;
    result = updateMaterialContent(result, content);
  }
  if (entry.addCoccatoResp) {
    result = addCoccatoRespStmt(result);
  }
  return result;
}

/**
 * Normalise an inscription identifier to canonical form (e.g. "ISic000001").
 * Accepts: "ISic000001", "isic000001", "000001", "1".
 * @param {string} input
 * @returns {string}
 */
export function normalizeIsic(input) {
  const digits = input.replace(/^isic/i, "").replace(/\D/g, "");
  return `ISic${digits.padStart(6, "0")}`;
}

/**
 * Read the petrography JSON, apply changes to each inscription XML file,
 * and write the modified files back.
 *
 * @param {string} jsonPath - path to petrography.json
 * @param {string} xmlDir - directory containing ISic*.xml files
 * @param {string[]} [filter] - optional list of inscription identifiers to process
 *   (any format accepted by normalizeIsic); processes all records when omitted
 */
export async function importPetrographyJson(jsonPath, xmlDir, filter = []) {
  const allRecords = JSON.parse(await fs.readFile(jsonPath, "utf-8"));

  const normalizedFilter = filter.map(normalizeIsic);
  const records =
    normalizedFilter.length > 0
      ? allRecords.filter((r) => normalizedFilter.includes(r.isic))
      : allRecords;

  let modified = 0;
  let skipped = 0;

  for (const entry of records) {
    const xmlPath = path.join(xmlDir, `${entry.isic}.xml`);
    let xml;
    try {
      xml = await fs.readFile(xmlPath, "utf-8");
    } catch {
      console.warn(
        `[petrography-import] Skipping ${entry.isic}: XML file not found`,
      );
      skipped++;
      continue;
    }

    const updated = applyPetrographyImport(xml, entry);

    if (updated === xml) {
      console.warn(
        `[petrography-import] No changes made to ${entry.isic} (material element not found?)`,
      );
      skipped++;
      continue;
    }

    await fs.writeFile(xmlPath, updated);
    modified++;
  }

  console.log(
    `[petrography-import] Done. Modified: ${modified}, Skipped: ${skipped}`,
  );
}

export async function main() {
  const jsonPath = path.join(DATA_DIR, "processed", "petrography.json");
  const xmlDir = path.join(DATA_DIR, "raw", "inscriptions");

  const filter = process.argv.slice(2);

  try {
    await importPetrographyJson(jsonPath, xmlDir, filter);
  } catch (error) {
    console.error("[petrography-import] Error:", error);
    process.exit(1);
  }
}

const isDirectRun =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isDirectRun) {
  main();
}
