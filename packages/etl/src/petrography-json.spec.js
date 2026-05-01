import { describe, it, expect } from "vitest";
import {
  parseCsv,
  buildReferenceLookup,
  buildProvenance,
  buildDetailSubtypes,
  buildDetailDescriptions,
  cleanDescription,
  deriveTypeFromAna,
  resolveAna,
  extractAnaFromXml,
  buildRecords,
} from "./petrography-json.js";

// ---------------------------------------------------------------------------
// parseCsv
// ---------------------------------------------------------------------------
describe("parseCsv", () => {
  it("parses CSV content into row objects using headers", async () => {
    const csv = `ISic,type,subtype\nISic000001,ceramic,unverified\n`;
    const rows = await parseCsv(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ ISic: "ISic000001", type: "ceramic", subtype: "unverified" });
  });

  it("skips empty lines", async () => {
    const csv = `ISic,type\nISic000001,ceramic\n\nISic000002,metal\n`;
    const rows = await parseCsv(csv);
    expect(rows).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// buildReferenceLookup
// ---------------------------------------------------------------------------
describe("buildReferenceLookup", () => {
  it("maps type|subtype to ana", () => {
    const rows = [
      { ana: "#material.inorganic.ceramic", "type (expanded)": "ceramic", type: "ceramic", subtype: "unverified" },
      { ana: "#material.inorganic.metal.bronze", "type (expanded)": "metal.bronze", type: "metal.bronze", subtype: "unverified" },
    ];
    const lookup = buildReferenceLookup(rows);
    expect(lookup.get("ceramic|unverified")).toBe("#material.inorganic.ceramic");
    expect(lookup.get("metal.bronze|unverified")).toBe("#material.inorganic.metal.bronze");
  });

  it("skips rows missing required fields", () => {
    const rows = [
      { ana: "", type: "ceramic", subtype: "unverified" },
      { ana: "#material.inorganic.ceramic", type: "", subtype: "unverified" },
    ];
    const lookup = buildReferenceLookup(rows);
    expect(lookup.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildProvenance
// ---------------------------------------------------------------------------
describe("buildProvenance", () => {
  const provenanceRow = {
    subtype: "Proconnesian",
    placeName: "Marmara District",
    coordinates: "40.61972, \u00a027.61694",
    "radius (m)": "",
    uri: "https://www.geonames.org/741729/marmara-adasi.html",
  };

  it("builds a map of subtype to provenance object", () => {
    const lookup = buildProvenance([provenanceRow]);
    expect(lookup.has("Proconnesian")).toBe(true);
    const prov = lookup.get("Proconnesian");
    expect(prov.placeName).toBe("Marmara District");
    expect(prov.uri).toBe("https://www.geonames.org/741729/marmara-adasi.html");
  });

  it("normalises coordinates to lat,lon with no whitespace", () => {
    const lookup = buildProvenance([provenanceRow]);
    expect(lookup.get("Proconnesian").coordinates).toBe("40.61972,27.61694");
  });

  it("sets radius to null when the column is empty", () => {
    const lookup = buildProvenance([provenanceRow]);
    expect(lookup.get("Proconnesian").radius).toBeNull();
  });

  it("captures radius when present", () => {
    const row = { ...provenanceRow, "radius (m)": "30000" };
    const lookup = buildProvenance([row]);
    expect(lookup.get("Proconnesian").radius).toBe("30000");
  });

  it("skips rows missing placeName, coordinates, or uri", () => {
    const rows = [
      { subtype: "Proconnesian", placeName: "", coordinates: "40.0,27.0", uri: "https://example.com" },
      { subtype: "Parian-1", placeName: "Paros", coordinates: "", uri: "https://example.com" },
      { subtype: "Parian-2", placeName: "Paros", coordinates: "37.0,25.0", uri: "" },
    ];
    expect(buildProvenance(rows).size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildDetailSubtypes
// ---------------------------------------------------------------------------
describe("buildDetailSubtypes", () => {
  it("builds a map of ISic to subtype", () => {
    const rows = [
      { ISic: "ISic000027", subtype: "Proconnesian" },
      { ISic: "ISic000034", subtype: "Parian-2" },
    ];
    const map = buildDetailSubtypes(rows);
    expect(map.get("ISic000027")).toBe("Proconnesian");
    expect(map.get("ISic000034")).toBe("Parian-2");
  });

  it("merges unique subtypes for duplicate ISic entries with pipe separator", () => {
    const rows = [
      { ISic: "ISic000009", subtype: "LTM" },
      { ISic: "ISic000009", subtype: "CMI" },
    ];
    const map = buildDetailSubtypes(rows);
    const result = map.get("ISic000009");
    expect(result).toBeDefined();
    expect(result.split("|").sort()).toEqual(["CMI", "LTM"]);
  });

  it("deduplicates identical subtypes for the same ISic", () => {
    const rows = [
      { ISic: "ISic000009", subtype: "LTM" },
      { ISic: "ISic000009", subtype: "LTM" },
    ];
    const map = buildDetailSubtypes(rows);
    expect(map.get("ISic000009")).toBe("LTM");
  });

  it("splits comma-separated subtypes within a cell", () => {
    const rows = [{ ISic: "ISic000009", subtype: "LTM, CMI" }];
    const map = buildDetailSubtypes(rows);
    const result = map.get("ISic000009").split("|").sort();
    expect(result).toEqual(["CMI", "LTM"]);
  });

  it("skips rows with missing ISic or subtype", () => {
    const rows = [
      { ISic: "", subtype: "LTM" },
      { ISic: "ISic000027", subtype: "" },
    ];
    const map = buildDetailSubtypes(rows);
    expect(map.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// cleanDescription
// ---------------------------------------------------------------------------
describe("cleanDescription", () => {
  it("removes trailing period and surrounding whitespace", () => {
    expect(cleanDescription("fine-grained marble. ")).toBe("fine-grained marble");
  });

  it("collapses consecutive empty comma items inside parens", () => {
    expect(cleanDescription("(fabric, microstructure, with, , , , )")).toBe("(fabric, microstructure)");
  });

  it("removes trailing ', with' before closing paren when all following fields are empty", () => {
    expect(cleanDescription("(heteroblastic fabric, mortar microstructure, with, , , , )")).toBe(
      "(heteroblastic fabric, mortar microstructure)"
    );
  });

  it("removes trailing comma before closing paren", () => {
    expect(cleanDescription("(fabric, )")).toBe("(fabric)");
  });

  it("removes empty parentheses left after cleanup", () => {
    expect(cleanDescription("marble ()")).toBe("marble");
    expect(cleanDescription("marble (with, , , , )")).toBe("marble");
  });

  it("collapses multiple spaces from empty field prefixes", () => {
    expect(cleanDescription("heteroblastic fabric,  microstructure")).toBe(
      "heteroblastic fabric, microstructure"
    );
  });

  it("handles a realistic full description with multiple artifacts", () => {
    const input =
      "fine-grained, banded, grey marble, likely Proconnesian (heteroblastic fabric,  microstructure, with, , , , ). ";
    expect(cleanDescription(input)).toBe(
      "fine-grained, banded, grey marble, likely Proconnesian (heteroblastic fabric, microstructure)"
    );
  });

  it("leaves a clean description unchanged", () => {
    const clean = "fine-grained white marble (identification based on pXRF, digital microscopy)";
    expect(cleanDescription(clean)).toBe(clean);
  });
});

// ---------------------------------------------------------------------------
// buildDetailDescriptions
// ---------------------------------------------------------------------------
describe("buildDetailDescriptions", () => {
  it("maps ISic to text description", () => {
    const rows = [
      { ISic: "ISic000027", "text description": "fine-grained white marble" },
      { ISic: "ISic000034", "text description": "medium-grained grey marble" },
    ];
    const map = buildDetailDescriptions(rows);
    expect(map.get("ISic000027")).toBe("fine-grained white marble");
    expect(map.get("ISic000034")).toBe("medium-grained grey marble");
  });

  it("takes the first non-empty description when an ISic appears multiple times", () => {
    const rows = [
      { ISic: "ISic000009", "text description": "first description" },
      { ISic: "ISic000009", "text description": "second description" },
    ];
    const map = buildDetailDescriptions(rows);
    expect(map.get("ISic000009")).toBe("first description");
  });

  it("skips rows with missing ISic or empty description", () => {
    const rows = [
      { ISic: "", "text description": "some text" },
      { ISic: "ISic000027", "text description": "" },
    ];
    const map = buildDetailDescriptions(rows);
    expect(map.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// deriveTypeFromAna
// ---------------------------------------------------------------------------
describe("deriveTypeFromAna", () => {
  it("strips #material. prefix", () => {
    expect(deriveTypeFromAna("#material.stone.marble")).toBe("stone.marble");
  });

  it("returns stone.unspecified when @ana is #material.stone", () => {
    expect(deriveTypeFromAna("#material.stone")).toBe("stone.unspecified");
  });

  it("returns stone.unspecified when @ana is null", () => {
    expect(deriveTypeFromAna(null)).toBe("stone.unspecified");
  });

  it("returns stone.unspecified when @ana does not match expected pattern", () => {
    expect(deriveTypeFromAna("unexpected-value")).toBe("stone.unspecified");
  });

  it("uses the first value when @ana has multiple space-separated values", () => {
    expect(deriveTypeFromAna("#material.stone.marble #material.stone.limestone")).toBe(
      "stone.marble"
    );
  });
});

// ---------------------------------------------------------------------------
// resolveAna
// ---------------------------------------------------------------------------
describe("resolveAna", () => {
  const refLookup = new Map([
    ["ceramic|unverified", "#material.inorganic.ceramic"],
    ["stone.marble|unverified", "#material.inorganic.stone.marble"],
    ["stone.marble|unspecified", "#material.inorganic.stone.marble.unspecified"],
    ["stone.marble|Proconnesian", "#material.inorganic.stone.marble.proconnesian"],
    ["stone.marble|Parian-2", "#material.inorganic.stone.marble.parian"],
  ]);

  it("returns ana for unverified subtype with no warnings", () => {
    const { ana, warnings } = resolveAna(refLookup, "ceramic", "unverified");
    expect(ana).toBe("#material.inorganic.ceramic");
    expect(warnings).toHaveLength(0);
  });

  it("returns ana for unspecified subtype with no warnings", () => {
    const { ana, warnings } = resolveAna(refLookup, "stone.marble", "unspecified");
    expect(ana).toBe("#material.inorganic.stone.marble.unspecified");
    expect(warnings).toHaveLength(0);
  });

  it("looks up each pipe-separated subtype and joins results with space", () => {
    const { ana, warnings } = resolveAna(refLookup, "stone.marble", "Proconnesian|Parian-2");
    expect(ana).toBe(
      "#material.inorganic.stone.marble.proconnesian #material.inorganic.stone.marble.parian"
    );
    expect(warnings).toHaveLength(0);
  });

  it("returns a warning and empty ana for a missing lookup", () => {
    const { ana, warnings } = resolveAna(refLookup, "stone.marble", "Unknown");
    expect(ana).toBe("");
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Missing reference lookup");
    expect(warnings[0]).toContain('type="stone.marble"');
    expect(warnings[0]).toContain('subtype="Unknown"');
  });

  it("returns one warning per missing subtype when multiple are present", () => {
    const { warnings } = resolveAna(refLookup, "stone.marble", "Unknown1|Unknown2");
    expect(warnings).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// extractAnaFromXml
// ---------------------------------------------------------------------------
describe("extractAnaFromXml", () => {
  it("extracts the ana attribute from a material element", () => {
    const xml = `<material ana="#material.stone.marble" ref="http://example.com">marble</material>`;
    expect(extractAnaFromXml(xml)).toBe("#material.stone.marble");
  });

  it("returns null when material element has no ana attribute", () => {
    const xml = `<material ref="http://example.com">marble</material>`;
    expect(extractAnaFromXml(xml)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// buildRecords
// ---------------------------------------------------------------------------
describe("buildRecords", () => {
  const refLookup = new Map([
    ["ceramic|unverified", "#material.inorganic.ceramic"],
    ["stone.marble|unverified", "#material.inorganic.stone.marble"],
    ["stone.marble|unspecified", "#material.inorganic.stone.marble.unspecified"],
    ["stone.marble|Proconnesian", "#material.inorganic.stone.marble.proconnesian"],
    ["stone.limestone|unspecified", "#material.inorganic.stone.limestone.unspecified"],
    ["stone.unspecified|unverified", "#material.inorganic.stone"],
  ]);

  const detailSubtypes = new Map([["ISic000027", "Proconnesian"]]);
  const detailDescriptions = new Map([["ISic000027", "fine-grained, banded, white marble, likely Proconnesian"]]);

  /** @param {string} _isic */
  const readXml = async (_isic) => ({
    xml: `<material ana="#material.stone.marble" ref="...">marble</material>`,
    warning: null,
  });

  it("non-stone: subtype=unverified, addCoccatoResp=false, description=null, no warnings", async () => {
    const nonstoneRows = [{ ISic: "ISic000079", type: "ceramic", subtype: "unverified" }];
    const records = await buildRecords({
      refLookup, detailSubtypes, detailDescriptions, stoneRows: [], nonstoneRows, readXml,
    });
    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      isic: "ISic000079",
      type: "ceramic",
      subtype: "unverified",
      ana: "#material.inorganic.ceramic",
      addCoccatoResp: false,
      description: null,
      warnings: [],
    });
  });

  it("stone subtype=unverified: type from XML ana, addCoccatoResp=false, description=null", async () => {
    const stoneRows = [{ ISic: "ISic000281", type: "stone.marble", subtype: "unverified", "identification based on": "" }];
    const records = await buildRecords({
      refLookup, detailSubtypes, detailDescriptions, stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0]).toMatchObject({
      type: "stone.marble",
      subtype: "unverified",
      addCoccatoResp: false,
      description: null,
      warnings: [],
    });
  });

  it("stone subtype=unverified: captures readXml warning when XML cannot be read", async () => {
    const failingReadXml = async (_isic) => ({ xml: null, warning: "Could not read XML for ISic000999" });
    const stoneRows = [{ ISic: "ISic000999", type: "stone.marble", subtype: "unverified", "identification based on": "" }];
    const records = await buildRecords({
      refLookup, detailSubtypes, detailDescriptions, stoneRows, nonstoneRows: [],
      readXml: failingReadXml,
    });
    expect(records[0].warnings).toContain("Could not read XML for ISic000999");
    expect(records[0].type).toBe("stone.unspecified");
    expect(records[0].description).toBeNull();
  });

  it("stone @ana=#material.stone → type=stone.unspecified", async () => {
    const stoneRows = [{ ISic: "ISic000999", type: "stone", subtype: "unverified", "identification based on": "" }];
    const xmlWithPlainStone = async (_isic) => ({
      xml: `<material ana="#material.stone" ref="...">stone</material>`,
      warning: null,
    });
    const records = await buildRecords({
      refLookup, detailSubtypes, detailDescriptions, stoneRows, nonstoneRows: [],
      readXml: xmlWithPlainStone,
    });
    expect(records[0].type).toBe("stone.unspecified");
  });

  it("stone subtype=unspecified: type from CSV, addCoccatoResp=true, description=null", async () => {
    const stoneRows = [{ ISic: "ISic000085", type: "stone.limestone", subtype: "unspecified", "identification based on": "" }];
    const records = await buildRecords({
      refLookup, detailSubtypes, detailDescriptions, stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0]).toMatchObject({
      isic: "ISic000085",
      type: "stone.limestone",
      subtype: "unspecified",
      addCoccatoResp: true,
      description: null,
      warnings: [],
    });
  });

  it("stone blank subtype: subtype from detail CSVs, description assembled from text desc + identification basis", async () => {
    const stoneRows = [{
      ISic: "ISic000027",
      type: "stone.marble",
      subtype: "",
      "identification based on": "identification based on digital microscopy",
    }];
    const records = await buildRecords({
      refLookup, detailSubtypes, detailDescriptions, stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0]).toMatchObject({
      isic: "ISic000027",
      type: "stone.marble",
      subtype: "Proconnesian",
      ana: "#material.inorganic.stone.marble.proconnesian",
      addCoccatoResp: true,
      description: "fine-grained, banded, white marble, likely Proconnesian (identification based on digital microscopy)",
      warnings: [],
    });
  });

  it("stone blank subtype: description omits parenthetical when identification basis is absent", async () => {
    const stoneRows = [{ ISic: "ISic000027", type: "stone.marble", subtype: "", "identification based on": "" }];
    const records = await buildRecords({
      refLookup, detailSubtypes, detailDescriptions, stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0].description).toBe("fine-grained, banded, white marble, likely Proconnesian");
  });

  it("stone blank subtype: warns and sets description=null when no text description in detail CSVs", async () => {
    const stoneRows = [{ ISic: "ISic000999", type: "stone.marble", subtype: "", "identification based on": "" }];
    const records = await buildRecords({
      refLookup, detailSubtypes: new Map([["ISic000999", "Proconnesian"]]),
      detailDescriptions: new Map(),
      stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0].description).toBeNull();
    expect(records[0].warnings.some((w) => w.includes("No text description found"))).toBe(true);
  });

  it("stone blank subtype: warns when no detail subtype found in detail CSVs", async () => {
    const stoneRows = [{ ISic: "ISic000999", type: "stone.marble", subtype: "", "identification based on": "" }];
    const records = await buildRecords({
      refLookup, detailSubtypes: new Map(), detailDescriptions: new Map(),
      stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0].warnings.some((w) => w.includes("No detail subtype found"))).toBe(true);
  });

  it("non-stone: provenance is null", async () => {
    const nonstoneRows = [{ ISic: "ISic000079", type: "ceramic", subtype: "unverified" }];
    const records = await buildRecords({
      refLookup, detailSubtypes, detailDescriptions, stoneRows: [], nonstoneRows, readXml,
    });
    expect(records[0].provenance).toBeNull();
  });

  it("stone blank subtype with single subtype: provenance from lookup", async () => {
    const provenanceLookup = new Map([
      ["Proconnesian", { placeName: "Marmara District", coordinates: "40.61972,27.61694", radius: null, uri: "https://www.geonames.org/741729/" }],
    ]);
    const stoneRows = [{ ISic: "ISic000027", type: "stone.marble", subtype: "", "identification based on": "" }];
    const records = await buildRecords({
      refLookup, provenanceLookup, detailSubtypes, detailDescriptions, stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0].provenance).toEqual({
      placeName: "Marmara District",
      coordinates: "40.61972,27.61694",
      radius: null,
      uri: "https://www.geonames.org/741729/",
    });
  });

  it("stone blank subtype with multiple subtypes: provenance is null", async () => {
    const provenanceLookup = new Map([
      ["Parian-1", { placeName: "Paros", coordinates: "37.05722,25.1875", radius: null, uri: "https://example.com" }],
    ]);
    const multiSubtypes = new Map([["ISic000027", "Parian-1|Parian-2"]]);
    const stoneRows = [{ ISic: "ISic000027", type: "stone.marble", subtype: "", "identification based on": "" }];
    const records = await buildRecords({
      refLookup, provenanceLookup, detailSubtypes: multiSubtypes, detailDescriptions, stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0].provenance).toBeNull();
  });

  it("stone blank subtype with single subtype not in provenance lookup: provenance is null", async () => {
    const stoneRows = [{ ISic: "ISic000027", type: "stone.marble", subtype: "", "identification based on": "" }];
    const records = await buildRecords({
      refLookup, provenanceLookup: new Map(), detailSubtypes, detailDescriptions, stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0].provenance).toBeNull();
  });

  it("stone blank subtype: warns when reference lookup fails for resolved subtype", async () => {
    const stoneRows = [{ ISic: "ISic000027", type: "stone.marble", subtype: "", "identification based on": "" }];
    const records = await buildRecords({
      refLookup,
      detailSubtypes: new Map([["ISic000027", "UnknownSubtype"]]),
      detailDescriptions,
      stoneRows, nonstoneRows: [], readXml,
    });
    expect(records[0].warnings.some((w) => w.includes("Missing reference lookup"))).toBe(true);
  });
});
