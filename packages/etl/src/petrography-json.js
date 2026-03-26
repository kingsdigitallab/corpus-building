import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, "../../../data");

/**
 * Parse CSV content string into an array of row objects.
 * @param {string} content
 * @returns {Promise<Record<string, string>[]>}
 */
export async function parseCsv(content) {
  const rows = [];
  const parser = parse(content, { columns: true, skip_empty_lines: true });
  for await (const row of parser) {
    rows.push(row);
  }
  return rows;
}

/**
 * Build a lookup Map from the reference CSV rows.
 * Key: "type|subtype", Value: ana string.
 * @param {Record<string, string>[]} rows
 * @returns {Map<string, string>}
 */
export function buildReferenceLookup(rows) {
  const lookup = new Map();
  for (const row of rows) {
    const type = row["type"]?.trim();
    const subtype = row["subtype"]?.trim();
    const ana = row["ana"]?.trim();
    if (type && subtype && ana) {
      lookup.set(`${type}|${subtype}`, ana);
    }
  }
  return lookup;
}

/**
 * Build a lookup Map of provenance data from the reference CSV rows.
 * Key: subtype value. Value: { placeName, coordinates, radius, uri }.
 * Only rows that have all of placeName, coordinates, and uri are included.
 * Coordinates are normalised to "lat,lon" (all whitespace removed).
 * @param {Record<string, string>[]} rows
 * @returns {Map<string, { placeName: string, coordinates: string, radius: string | null, uri: string }>}
 */
export function buildProvenance(rows) {
  const lookup = new Map();
  for (const row of rows) {
    const subtype = row["subtype"]?.trim();
    const placeName = row["placeName"]?.trim();
    // Strip all whitespace including non-breaking spaces (U+00A0) to get "lat,lon"
    const coordinates = row["coordinates"]?.replace(/[^\d.,\-]/g, "").trim();
    const radius = row["radius (m)"]?.trim() || null;
    const uri = row["uri"]?.trim();
    if (subtype && placeName && coordinates && uri) {
      lookup.set(subtype, { placeName, coordinates, radius, uri });
    }
  }
  return lookup;
}

/**
 * Build a lookup Map of detailed subtypes from Metamorphic, Sedimentary, and
 * Other CSV rows. Multiple rows for the same ISic have their unique subtype
 * values merged with "|".
 * @param {Record<string, string>[]} rows - combined rows from all detail CSVs
 * @returns {Map<string, string>} ISic → pipe-separated subtype string
 */
export function buildDetailSubtypes(rows) {
  /** @type {Map<string, Set<string>>} */
  const sets = new Map();
  for (const row of rows) {
    const isic = row["ISic"]?.trim();
    const rawSubtype = row["subtype"]?.trim();
    if (!isic || !rawSubtype) continue;
    if (!sets.has(isic)) sets.set(isic, new Set());
    // Values may be comma-separated within a single cell
    for (const s of rawSubtype.split(",").map((s) => s.trim()).filter(Boolean)) {
      sets.get(isic).add(s);
    }
  }
  const result = new Map();
  for (const [isic, subtypeSet] of sets) {
    result.set(isic, [...subtypeSet].join("|"));
  }
  return result;
}

/**
 * Clean up spreadsheet-generated text description artifacts:
 * - Trailing period and surrounding whitespace
 * - Consecutive empty comma items (", , , ,")
 * - Trailing ", with" before ")" when all following fields were empty
 * - Trailing comma before ")"
 * - Empty parentheses left after cleanup
 * - Multiple consecutive spaces from empty field prefixes
 * @param {string} text
 * @returns {string}
 */
export function cleanDescription(text) {
  return text
    .trim()
    .replace(/\(\s+/g, "(")        // openning parens followed by spaces
    .replace(/\.\s*$/, "")            // trailing period
    .replace(/(?:,\s*){2,}/g, ", ")   // ", , , ," → ", "
    .replace(/with,\s*(?=\))/g, "")   // "with," before ")" (after empty items collapsed)
    .replace(/,\s*\)/g, ")")          // trailing comma before closing paren
    .replace(/\(\s*\)/g, "")          // empty parens "()"
    .replace(/ {2,}/g, " ")           // multiple spaces → single space
    .trim();
}

/**
 * Build a lookup Map of text descriptions from Metamorphic, Sedimentary, and
 * Other CSV rows. When an ISic appears in multiple rows the first non-empty
 * description wins.
 * @param {Record<string, string>[]} rows - combined rows from all detail CSVs
 * @returns {Map<string, string>} ISic → text description string
 */
export function buildDetailDescriptions(rows) {
  const result = new Map();
  for (const row of rows) {
    const isic = row["ISic"]?.trim();
    const desc = row["text description"]?.trim();
    if (isic && desc && !result.has(isic)) {
      result.set(isic, desc);
    }
  }
  return result;
}

/**
 * Derive the @type value for an "unverified" stone from its existing @ana.
 * e.g. "#material.stone.marble" → "stone.marble"
 *      "#material.stone"        → "stone.unspecified"
 * @param {string | null} anaValue
 * @returns {string}
 */
export function deriveTypeFromAna(anaValue) {
  if (!anaValue) return "stone.unspecified";
  // @ana may contain multiple space-separated values; use the first
  const first = anaValue.trim().split(/\s+/)[0];
  const match = first.match(/^#material\.(.+)$/);
  if (!match) return "stone.unspecified";
  const typeStr = match[1];
  return typeStr === "stone" ? "stone.unspecified" : typeStr;
}

/**
 * Resolve the @ana attribute value using the reference lookup.
 * For specific (non-unverified/unspecified) subtypes each pipe-separated
 * value is looked up individually and the results joined with a space.
 * @param {Map<string, string>} refLookup
 * @param {string} type
 * @param {string} subtype
 * @returns {{ ana: string, warnings: string[] }}
 */
export function resolveAna(refLookup, type, subtype) {
  if (!subtype || subtype === "unverified" || subtype === "unspecified") {
    const key = `${type}|${subtype || "unverified"}`;
    const ana = refLookup.get(key);
    const warnings = ana ? [] : [`Missing reference lookup for type="${type}" subtype="${subtype}"`];
    return { ana: ana || "", warnings };
  }
  // Multiple specific subtypes
  const { anas, warnings } = subtype
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean)
    .reduce(
      ({ anas, warnings }, s) => {
        const found = refLookup.get(`${type}|${s}`);
        return found
          ? { anas: [...anas, found], warnings }
          : { anas, warnings: [...warnings, `Missing reference lookup for type="${type}" subtype="${s}"`] };
      },
      { anas: [], warnings: [] }
    );
  return { ana: anas.join(" "), warnings };
}

/**
 * Extract the @ana attribute value from an XML string.
 * @param {string} xml
 * @returns {string | null}
 */
export function extractAnaFromXml(xml) {
  const match = xml.match(/<material\s[^>]*ana="([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Build petrography records from pre-parsed data structures.
 * Exported for testability — call buildPetrographyJson for normal use.
 *
 * @param {{
 *   refLookup: Map<string, string>,
 *   provenanceLookup?: Map<string, { placeName: string, coordinates: string, radius: string | null, uri: string }>,
 *   detailSubtypes: Map<string, string>,
 *   detailDescriptions: Map<string, string>,
 *   stoneRows: Record<string, string>[],
 *   nonstoneRows: Record<string, string>[],
 *   readXml: (isic: string) => Promise<{ xml: string | null, warning: string | null }>
 * }} opts
 * @returns {Promise<Array<{isic: string, type: string, subtype: string, ana: string, addCoccatoResp: boolean, description: string | null, provenance: object | null, warnings: string[]}>>}
 */
export async function buildRecords({ refLookup, provenanceLookup = new Map(), detailSubtypes, detailDescriptions, stoneRows, nonstoneRows, readXml }) {
  const results = [];

  // Non-stone inscriptions: type from CSV col G, subtype always "unverified"
  // Leave existing <material> text content unchanged.
  for (const row of nonstoneRows) {
    const isic = row["ISic"]?.trim();
    if (!isic) continue;
    const type = row["type"]?.trim();
    if (!type) continue;
    const subtype = "unverified";
    const { ana, warnings } = resolveAna(refLookup, type, subtype);
    results.push({ isic, type, subtype, ana, addCoccatoResp: false, description: null, provenance: null, warnings });
  }

  // Stone inscriptions
  for (const row of stoneRows) {
    const isic = row["ISic"]?.trim();
    if (!isic) continue;
    const typeFromCsv = row["type"]?.trim();
    const subtypeCol = row["subtype"]?.trim();

    let type, subtype, addCoccatoResp;
    let description = null;
    let preWarnings = [];

    if (subtypeCol === "unverified") {
      // Derive type from the existing XML @ana value.
      // Leave existing <material> text content unchanged.
      const { xml, warning } = await readXml(isic);
      if (warning) preWarnings = [warning];
      const existingAna = xml ? extractAnaFromXml(xml) : null;
      type = deriveTypeFromAna(existingAna);
      subtype = "unverified";
      addCoccatoResp = false;
    } else if (subtypeCol === "unspecified") {
      // Leave existing <material> text content unchanged.
      type = typeFromCsv || "";
      subtype = "unspecified";
      addCoccatoResp = true;
    } else {
      // blank — subtype and description come from detail CSVs
      type = typeFromCsv || "";
      const detailSubtype = detailSubtypes.get(isic);
      if (!detailSubtype) {
        preWarnings = [`No detail subtype found for ${isic} (blank subtype in stones CSV)`];
      }
      subtype = detailSubtype || "";
      addCoccatoResp = true;

      // Build <material> text content: "{text description} ({identification based on})"
      const rawTextDesc = detailDescriptions.get(isic);
      const textDesc = rawTextDesc ? cleanDescription(rawTextDesc) : null;
      const identBasis = row["identification based on"]?.trim();
      if (textDesc) {
        description = identBasis ? `${textDesc} (${identBasis})` : textDesc;
      } else {
        preWarnings = [...preWarnings, `No text description found for ${isic}`];
      }
    }

    // Provenance: look up by subtype only for single-value specific subtypes
    const isSpecificSingleSubtype =
      subtype && subtype !== "unverified" && subtype !== "unspecified" && !subtype.includes("|");
    const provenance = isSpecificSingleSubtype ? (provenanceLookup.get(subtype) ?? null) : null;

    const { ana, warnings: anaWarnings } = resolveAna(refLookup, type, subtype);
    results.push({ isic, type, subtype, ana, addCoccatoResp, description, provenance, warnings: [...preWarnings, ...anaWarnings] });
  }

  return results;
}

/**
 * Main entry point: reads all CSVs, builds the intermediate JSON, and writes
 * it to the output path.
 *
 * @param {{
 *   reference: string,
 *   stones: string,
 *   nonstones: string,
 *   metamorphic: string,
 *   sedimentary: string,
 *   other: string,
 *   xmlDir: string,
 *   output: string
 * }} paths
 */
export async function buildPetrographyJson(paths) {
  const [refContent, stonesContent, nonstonesContent, metaContent, sedContent, otherContent] =
    await Promise.all([
      fs.readFile(paths.reference, "utf-8"),
      fs.readFile(paths.stones, "utf-8"),
      fs.readFile(paths.nonstones, "utf-8"),
      fs.readFile(paths.metamorphic, "utf-8"),
      fs.readFile(paths.sedimentary, "utf-8"),
      fs.readFile(paths.other, "utf-8"),
    ]);

  const [refRows, stoneRows, nonstoneRows, metaRows, sedRows, otherRows] = await Promise.all([
    parseCsv(refContent),
    parseCsv(stonesContent),
    parseCsv(nonstonesContent),
    parseCsv(metaContent),
    parseCsv(sedContent),
    parseCsv(otherContent),
  ]);

  const refLookup = buildReferenceLookup(refRows);
  const provenanceLookup = buildProvenance(refRows);
  const detailRows = [...metaRows, ...sedRows, ...otherRows];
  const detailSubtypes = buildDetailSubtypes(detailRows);
  const detailDescriptions = buildDetailDescriptions(detailRows);

  /** @param {string} isic */
  async function readXml(isic) {
    try {
      const xml = await fs.readFile(path.join(paths.xmlDir, `${isic}.xml`), "utf-8");
      return { xml, warning: null };
    } catch {
      return { xml: null, warning: `Could not read XML for ${isic}` };
    }
  }

  const records = await buildRecords({ refLookup, provenanceLookup, detailSubtypes, detailDescriptions, stoneRows, nonstoneRows, readXml });
  const sortedRecords = records.toSorted((a, b) => a.isic.localeCompare(b.isic));

  await fs.writeFile(paths.output, JSON.stringify(sortedRecords, null, 2));

  const withWarnings = sortedRecords.filter((r) => r.warnings.length > 0);
  console.log(`[petrography-json] Wrote ${sortedRecords.length} records to ${paths.output}`);

  if (withWarnings.length > 0) {
    console.warn(`[petrography-json] ${withWarnings.length} record(s) have warnings — check the "warnings" field in the output JSON`);
  }
}

export async function main() {
  const petrographyDir = path.join(DATA_DIR, "petrography");
  const paths = {
    reference: path.join(petrographyDir, "petrography-reference.csv"),
    stones: path.join(petrographyDir, "petrography-stones.csv"),
    nonstones: path.join(petrographyDir, "petrography-nonstones.csv"),
    metamorphic: path.join(petrographyDir, "petrography-metamorphic.csv"),
    sedimentary: path.join(petrographyDir, "petrography-sedimentary.csv"),
    other: path.join(petrographyDir, "petrography-other.csv"),
    xmlDir: path.join(DATA_DIR, "raw", "inscriptions"),
    output: path.join(DATA_DIR, "processed", "petrography.json"),
  };

  try {
    await buildPetrographyJson(paths);
  } catch (error) {
    console.error("[petrography-json] Error:", error);
    process.exit(1);
  }
}

const isDirectRun = process.argv[1] && import.meta.url === `file://${process.argv[1]}`;
if (isDirectRun) {
  main();
}
