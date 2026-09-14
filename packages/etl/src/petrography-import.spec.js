import { describe, it, expect } from "vitest";
import {
  normalizeIsic,
  ensureMaterialElement,
  updateMaterialElement,
  updateMaterialContent,
  addCoccatoRespStmt,
  buildProvenanceXml,
  applyPetrographyImport,
  extractMaterialNotes,
} from "./petrography-import.js";

const MINIMAL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<TEI>
    <teiHeader>
        <fileDesc>
            <titleStmt>
                <title>ISic000027</title>
                <respStmt>
                    <name xml:id="JP">Jonathan Prag</name>
                    <resp>original data collection</resp>
                </respStmt>
            </titleStmt>
        </fileDesc>
    </teiHeader>
    <text>
        <body>
            <material ana="#material.stone.marble" ref="http://www.eagle-network.eu/voc/material/lod/48.html">marble
            </material>
        </body>
    </text>
</TEI>`;

const ENTRY_WITH_COCCATO = {
  isic: "ISic000027",
  type: "stone.marble",
  subtype: "Proconnesian",
  ana: "#material.inorganic.stone.metamorphic-rock.marble.calcitic-marble.proconnesian",
  addCoccatoResp: true,
  description: "fine-grained, banded, white marble, likely Proconnesian (identification based on digital microscopy)",
};

const ENTRY_WITHOUT_COCCATO = {
  isic: "ISic000079",
  type: "ceramic",
  subtype: "unverified",
  ana: "#material.inorganic.ceramic",
  addCoccatoResp: false,
  description: null,
};

const XML_NO_MATERIAL = `<?xml version="1.0" encoding="UTF-8"?>
<TEI>
    <teiHeader>
        <fileDesc>
            <titleStmt>
                <title>ISic003691</title>
            </titleStmt>
        </fileDesc>
    </teiHeader>
    <text>
        <body>
            <supportDesc>
                <support>
                    <dimensions>
                        <height unit="cm"/>
                        <width unit="cm"/>
                        <depth unit="cm"/>
                    </dimensions>
                </support>
            </supportDesc>
        </body>
    </text>
</TEI>`;

const XML_NO_MATERIAL_WITH_P = `<?xml version="1.0" encoding="UTF-8"?>
<TEI>
    <teiHeader>
        <fileDesc>
            <titleStmt>
                <title>ISic004053</title>
            </titleStmt>
        </fileDesc>
    </teiHeader>
    <text>
        <body>
            <supportDesc>
                <support>
                    <p>Inscription on face II.</p>
                    <p>On same support as ISic003963.</p>
                    <dimensions/>
                </support>
            </supportDesc>
        </body>
    </text>
</TEI>`;

const XML_WITH_MATERIAL_NOTE = `<?xml version="1.0" encoding="UTF-8"?>
<TEI>
    <teiHeader>
        <fileDesc>
            <titleStmt>
                <title>ISic000004</title>
            </titleStmt>
        </fileDesc>
    </teiHeader>
    <text>
        <body>
            <material ana="#material.stone.marble" ref="http://www.eagle-network.eu/voc/material/lod/48.html">old description <note>Petrographic imagery at <ref target="https://iiif.csad.ox.ac.uk/viewer/isicily/ISic000004">https://iiif.csad.ox.ac.uk/viewer/isicily/ISic000004</ref></note></material>
        </body>
    </text>
</TEI>`;

const ENTRY_WITH_NOTE = {
  isic: "ISic000004",
  type: "stone.marble",
  subtype: "Proconnesian",
  ana: "#material.inorganic.stone.metamorphic_rock.marble.calcitic_marble.Proconnesian",
  addCoccatoResp: true,
  description: "fine-grained, white marble, likely Proconnesian",
  provenance: null,
};

// ---------------------------------------------------------------------------
// normalizeIsic
// ---------------------------------------------------------------------------
describe("normalizeIsic", () => {
  it("accepts full canonical form", () => {
    expect(normalizeIsic("ISic000027")).toBe("ISic000027");
  });

  it("accepts lowercase prefix", () => {
    expect(normalizeIsic("isic000027")).toBe("ISic000027");
  });

  it("accepts zero-padded number only", () => {
    expect(normalizeIsic("000027")).toBe("ISic000027");
  });

  it("accepts bare integer and pads to 6 digits", () => {
    expect(normalizeIsic("1")).toBe("ISic000001");
    expect(normalizeIsic("27")).toBe("ISic000027");
  });
});

// ---------------------------------------------------------------------------
// ensureMaterialElement
// ---------------------------------------------------------------------------
describe("ensureMaterialElement", () => {
  it("creates <material>marble</material> inside <support> when no material exists", () => {
    const result = ensureMaterialElement(XML_NO_MATERIAL);
    expect(result).toContain("<material>marble</material>");
    const supportOpen = result.indexOf("<support>");
    const supportClose = result.indexOf("</support>");
    const materialPos = result.indexOf("<material>marble</material>");
    expect(materialPos).toBeGreaterThan(supportOpen);
    expect(materialPos).toBeLessThan(supportClose);
  });

  it("inserts material after the last <p> when <p> elements exist in <support>", () => {
    const result = ensureMaterialElement(XML_NO_MATERIAL_WITH_P);
    const materialPos = result.indexOf("<material>marble</material>");
    const lastPClose = result.lastIndexOf("</p>");
    const dimensionsPos = result.indexOf("<dimensions/>");
    expect(materialPos).toBeGreaterThan(lastPClose);
    expect(materialPos).toBeLessThan(dimensionsPos);
  });

  it("matches the indentation of existing children inside <support>", () => {
    const result = ensureMaterialElement(XML_NO_MATERIAL);
    const line = result.split("\n").find((l) => l.includes("<material>marble</material>"));
    expect(line).toMatch(/^                    <material>marble<\/material>$/);
  });

  it("returns xml unchanged when <material> already exists", () => {
    expect(ensureMaterialElement(MINIMAL_XML)).toBe(MINIMAL_XML);
  });

  it("returns xml unchanged when no <support> element exists", () => {
    const xml = "<TEI><body>no support here</body></TEI>";
    expect(ensureMaterialElement(xml)).toBe(xml);
  });
});

// ---------------------------------------------------------------------------
// updateMaterialElement
// ---------------------------------------------------------------------------
describe("updateMaterialElement", () => {
  it("adds @type and @subtype to the material element", () => {
    const result = updateMaterialElement(MINIMAL_XML, ENTRY_WITH_COCCATO);
    expect(result).toContain('type="stone.marble"');
    expect(result).toContain('subtype="Proconnesian"');
  });

  it("replaces existing @ana with new value", () => {
    const result = updateMaterialElement(MINIMAL_XML, ENTRY_WITH_COCCATO);
    expect(result).not.toContain("#material.stone.marble\"");
    expect(result).toContain('ana="#material.inorganic.stone.metamorphic-rock.marble.calcitic-marble.proconnesian"');
  });

  it("preserves existing attributes not being replaced (e.g. @ref)", () => {
    const result = updateMaterialElement(MINIMAL_XML, ENTRY_WITH_COCCATO);
    expect(result).toContain('ref="http://www.eagle-network.eu/voc/material/lod/48.html"');
  });

  it("adds @resp='#Coccato' when addCoccatoResp is true", () => {
    const result = updateMaterialElement(MINIMAL_XML, ENTRY_WITH_COCCATO);
    expect(result).toContain('resp="#Coccato"');
  });

  it("does not add @resp when addCoccatoResp is false", () => {
    const result = updateMaterialElement(MINIMAL_XML, ENTRY_WITHOUT_COCCATO);
    expect(result).not.toContain('resp="#Coccato"');
  });

  it("replaces existing @type and @subtype on re-run (idempotent attributes)", () => {
    const alreadyImported = MINIMAL_XML.replace(
      '<material ana="#material.stone.marble"',
      '<material ana="#material.stone.marble" type="stone.marble" subtype="Proconnesian"'
    );
    const result = updateMaterialElement(alreadyImported, ENTRY_WITH_COCCATO);
    // Should appear exactly once
    const typeMatches = result.match(/type="stone\.marble"/g);
    expect(typeMatches).toHaveLength(1);
  });

  it("returns xml unchanged when no material element is found", () => {
    const xml = "<TEI><body>no material here</body></TEI>";
    expect(updateMaterialElement(xml, ENTRY_WITH_COCCATO)).toBe(xml);
  });
});

// ---------------------------------------------------------------------------
// updateMaterialContent
// ---------------------------------------------------------------------------
describe("updateMaterialContent", () => {
  it("replaces text content between opening and closing material tags", () => {
    const result = updateMaterialContent(MINIMAL_XML, "fine-grained white marble");
    expect(result).toContain("<material");
    expect(result).toContain("fine-grained white marble");
    expect(result).toContain("</material>");
    expect(result).not.toContain(">marble");
  });

  it("preserves the opening tag attributes", () => {
    const result = updateMaterialContent(MINIMAL_XML, "new description");
    expect(result).toContain('ref="http://www.eagle-network.eu/voc/material/lod/48.html"');
  });

  it("replaces multi-line content", () => {
    const xml = `<TEI><material ana="#x" ref="y">marble\n            with extra whitespace\n            </material></TEI>`;
    const result = updateMaterialContent(xml, "new description");
    expect(result).toBe(`<TEI><material ana="#x" ref="y">new description</material></TEI>`);
  });
});

// ---------------------------------------------------------------------------
// extractMaterialNotes
// ---------------------------------------------------------------------------
describe("extractMaterialNotes", () => {
  it("extracts a <note> from inside <material>", () => {
    const notes = extractMaterialNotes(XML_WITH_MATERIAL_NOTE);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toContain("Petrographic imagery at");
    expect(notes[0]).toContain('<ref target="https://iiif.csad.ox.ac.uk/viewer/isicily/ISic000004">');
  });

  it("returns an empty array when <material> has no <note>", () => {
    expect(extractMaterialNotes(MINIMAL_XML)).toEqual([]);
  });

  it("returns an empty array when no <material> element exists", () => {
    expect(extractMaterialNotes("<TEI><body>no material</body></TEI>")).toEqual([]);
  });

  it("works with a bare <material> tag (no attributes)", () => {
    const xml = `<TEI><body><material>marble<note>test</note></material></body></TEI>`;
    const notes = extractMaterialNotes(xml);
    expect(notes).toHaveLength(1);
    expect(notes[0]).toBe("<note>test</note>");
  });

  it("extracts multiple notes when present", () => {
    const xml = `<TEI><body><material ana="#x">marble<note>first</note><note>second</note></material></body></TEI>`;
    const notes = extractMaterialNotes(xml);
    expect(notes).toHaveLength(2);
    expect(notes[0]).toContain("first");
    expect(notes[1]).toContain("second");
  });
});

// ---------------------------------------------------------------------------
// addCoccatoRespStmt
// ---------------------------------------------------------------------------
describe("addCoccatoRespStmt", () => {
  it("inserts Coccato respStmt before </titleStmt>", () => {
    const result = addCoccatoRespStmt(MINIMAL_XML);
    expect(result).toContain('xml:id="Coccato"');
    expect(result).toContain("Alessia Coccato");
    expect(result).toContain("Petrographic observation and analysis");
    // respStmt must appear before </titleStmt>
    const coccatoPos = result.indexOf('xml:id="Coccato"');
    const closingPos = result.indexOf("</titleStmt>");
    expect(coccatoPos).toBeLessThan(closingPos);
  });

  it("does not insert a second respStmt when Coccato is already present (idempotent)", () => {
    const once = addCoccatoRespStmt(MINIMAL_XML);
    const twice = addCoccatoRespStmt(once);
    const count = (twice.match(/xml:id="Coccato"/g) || []).length;
    expect(count).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// buildProvenanceXml
// ---------------------------------------------------------------------------
describe("buildProvenanceXml", () => {
  const prov = {
    placeName: "Marmara District",
    coordinates: "40.61972,27.61694",
    radius: null,
    uri: "https://www.geonames.org/741729/marmara-adasi.html",
  };

  it("contains placeName text inside <ref> with target URI", () => {
    const xml = buildProvenanceXml(prov);
    expect(xml).toContain('<ref target="https://www.geonames.org/741729/marmara-adasi.html">Marmara District</ref>');
  });

  it("contains geo coordinates inside <location>", () => {
    const xml = buildProvenanceXml(prov);
    expect(xml).toContain("<geo>40.61972,27.61694</geo>");
    const locationOpen = xml.indexOf("<location>");
    const geoPos = xml.indexOf("<geo>");
    const locationClose = xml.indexOf("</location>");
    expect(geoPos).toBeGreaterThan(locationOpen);
    expect(geoPos).toBeLessThan(locationClose);
  });

  it("wraps content in <placeName type=\"provenance\">", () => {
    const xml = buildProvenanceXml(prov);
    expect(xml).toContain('<placeName type="provenance">');
    expect(xml).toContain("</placeName>");
  });

  it("omits <precision> when radius is null", () => {
    expect(buildProvenanceXml(prov)).not.toContain("<precision");
  });

  it("includes <precision> inside <location> after <geo> when radius is set", () => {
    const xml = buildProvenanceXml({ ...prov, radius: "30000" });
    expect(xml).toContain('<precision match="preceding-sibling::geo" n="30000"/>');
    const geoPos = xml.indexOf("<geo>");
    const precPos = xml.indexOf("<precision");
    const locationClose = xml.indexOf("</location>");
    expect(precPos).toBeGreaterThan(geoPos);
    expect(precPos).toBeLessThan(locationClose);
  });
});

// ---------------------------------------------------------------------------
// applyPetrographyImport
// ---------------------------------------------------------------------------
describe("applyPetrographyImport", () => {
  it("updates attributes, replaces content, and inserts respStmt when addCoccatoResp=true", () => {
    const result = applyPetrographyImport(MINIMAL_XML, ENTRY_WITH_COCCATO);
    expect(result).toContain('type="stone.marble"');
    expect(result).toContain('subtype="Proconnesian"');
    expect(result).toContain('resp="#Coccato"');
    expect(result).toContain('xml:id="Coccato"');
    expect(result).toContain("fine-grained, banded, white marble, likely Proconnesian");
    expect(result).not.toContain(">marble");
  });

  it("does not replace content when description is null", () => {
    const result = applyPetrographyImport(MINIMAL_XML, ENTRY_WITHOUT_COCCATO);
    expect(result).toContain(">marble");
  });

  it("does not insert respStmt when addCoccatoResp=false", () => {
    const result = applyPetrographyImport(MINIMAL_XML, ENTRY_WITHOUT_COCCATO);
    expect(result).not.toContain('xml:id="Coccato"');
    expect(result).not.toContain('resp="#Coccato"');
  });

  it("appends provenance XML inside material when description and provenance are both present", () => {
    const entry = {
      ...ENTRY_WITH_COCCATO,
      provenance: {
        placeName: "Marmara District",
        coordinates: "40.61972,27.61694",
        radius: null,
        uri: "https://www.geonames.org/741729/marmara-adasi.html",
      },
    };
    const result = applyPetrographyImport(MINIMAL_XML, entry);
    expect(result).toContain('<ref target="https://www.geonames.org/741729/marmara-adasi.html">Marmara District</ref>');
    expect(result).toContain("<geo>40.61972,27.61694</geo>");
    // provenance must appear inside the material element
    const matOpen = result.indexOf("<material");
    const matClose = result.indexOf("</material>");
    const placeNamePos = result.indexOf('<placeName type="provenance">');
    expect(placeNamePos).toBeGreaterThan(matOpen);
    expect(placeNamePos).toBeLessThan(matClose);
  });

  it("is fully idempotent with provenance: running twice produces the same result as running once", () => {
    const entry = {
      ...ENTRY_WITH_COCCATO,
      provenance: {
        placeName: "Marmara District",
        coordinates: "40.61972,27.61694",
        radius: null,
        uri: "https://www.geonames.org/741729/marmara-adasi.html",
      },
    };
    const once = applyPetrographyImport(MINIMAL_XML, entry);
    const twice = applyPetrographyImport(once, entry);
    expect(twice).toBe(once);
  });

  it("is fully idempotent: running twice produces the same result as running once", () => {
    const once = applyPetrographyImport(MINIMAL_XML, ENTRY_WITH_COCCATO);
    const twice = applyPetrographyImport(once, ENTRY_WITH_COCCATO);
    expect(twice).toBe(once);
  });

  it("creates and enriches material when no <material> element exists", () => {
    const result = applyPetrographyImport(XML_NO_MATERIAL, ENTRY_WITH_COCCATO);
    expect(result).toContain('type="stone.marble"');
    expect(result).toContain('subtype="Proconnesian"');
    expect(result).toContain('resp="#Coccato"');
    expect(result).toContain('xml:id="Coccato"');
    expect(result).toContain("fine-grained, banded, white marble, likely Proconnesian");
    expect(result).not.toContain("<material>marble</material>");
  });

  it("preserves <note> elements inside <material> when description is replaced", () => {
    const result = applyPetrographyImport(XML_WITH_MATERIAL_NOTE, ENTRY_WITH_NOTE);
    expect(result).toContain("fine-grained, white marble, likely Proconnesian");
    expect(result).toContain("Petrographic imagery at");
    expect(result).toContain('<ref target="https://iiif.csad.ox.ac.uk/viewer/isicily/ISic000004">');
    // note must appear inside the material element
    const matOpen = result.indexOf("<material");
    const matClose = result.indexOf("</material>");
    const notePos = result.indexOf("<note>");
    expect(notePos).toBeGreaterThan(matOpen);
    expect(notePos).toBeLessThan(matClose);
  });

  it("places <note> after provenance when both are present", () => {
    const entry = {
      ...ENTRY_WITH_NOTE,
      provenance: {
        placeName: "Marmara District",
        coordinates: "40.61972,27.61694",
        radius: null,
        uri: "https://www.geonames.org/741729/marmara-adasi.html",
      },
    };
    const result = applyPetrographyImport(XML_WITH_MATERIAL_NOTE, entry);
    const notePos = result.indexOf("<note>");
    const provPos = result.indexOf('<placeName type="provenance">');
    const matClose = result.indexOf("</material>");
    expect(provPos).toBeGreaterThan(result.indexOf("<material"));
    expect(notePos).toBeGreaterThan(provPos);
    expect(notePos).toBeLessThan(matClose);
  });

  it("is idempotent with notes: running twice produces the same result as once", () => {
    const once = applyPetrographyImport(XML_WITH_MATERIAL_NOTE, ENTRY_WITH_NOTE);
    const twice = applyPetrographyImport(once, ENTRY_WITH_NOTE);
    expect(twice).toBe(once);
  });
});
