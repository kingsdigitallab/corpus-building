import { describe, it, expect } from "vitest";
import {
  normalizeIsic,
  updateMaterialElement,
  updateMaterialContent,
  addCoccatoRespStmt,
  applyPetrographyImport,
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

  it("is fully idempotent: running twice produces the same result as running once", () => {
    const once = applyPetrographyImport(MINIMAL_XML, ENTRY_WITH_COCCATO);
    const twice = applyPetrographyImport(once, ENTRY_WITH_COCCATO);
    expect(twice).toBe(once);
  });
});
