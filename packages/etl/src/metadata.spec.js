import { describe, it, expect } from "vitest";
import xml2js from "xml2js";
import { metadataExtractors } from "./metadata";

async function createXmlObject(xmlString) {
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
  return await parser.parseStringPromise(xmlString);
}

describe("getURI function", () => {
  it("should return the URI when it exists", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <publicationStmt>
              <idno type="URI">http://sicily.classics.ox.ac.uk/inscription/ISic000612</idno>
              <idno type="DOI">ISic000612</idno>
            </publicationStmt>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getURI(xml)).toBe("ISic000612");
  });

  it("should return undefined when no URI is present", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <publicationStmt>
              <idno type="DOI">ISic000612</idno>
              <idno type="DOI">ISic000613</idno>
            </publicationStmt>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getURI(xml)).toBeUndefined();
  });

  it("should return the first URI when multiple URIs are present", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <publicationStmt>
              <idno type="URI">http://sicily.classics.ox.ac.uk/inscription/ISic000612</idno>
              <idno type="URI">http://sicily.classics.ox.ac.uk/inscription/ISic000613</idno>
            </publicationStmt>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getURI(xml)).toBe("ISic000612");
  });

  it("should return undefined when publicationStmt is empty", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <publicationStmt></publicationStmt>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getURI(xml)).toBeUndefined();
  });

  it("should return undefined when the XML structure is incomplete", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getURI(xml)).toBeUndefined();
  });
});

describe("getTitle function", () => {
  it("should return the title content when it's not empty", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <titleStmt>
              <title>Sample Title</title>
            </titleStmt>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getTitle(xml)).toBe("Sample Title");
  });

  it("should return an empty string when the title contains only whitespace", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <titleStmt>
              <title>   </title>
            </titleStmt>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getTitle(xml)).toBe("");
  });

  it("should return an undefined when no title is present", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <titleStmt>
            </titleStmt>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getTitle(xml)).toBe(undefined);
  });
});

describe("getStatus function", () => {
  it("should return 'draft'", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <revisionDesc>
            <status>draft</status>
          </revisionDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getStatus(xml)).toBe("draft");
  });

  it("should be empty", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <revisionDesc>
            <status></status>
          </revisionDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getStatus(xml)).toBe("");
  });

  it("should be undefined", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <revisionDesc>
          </revisionDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getStatus(xml)).toBe(undefined);
  });
});

describe("getType function", () => {
  it("should return the type", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <profileDesc>
            <textClass>
              <keywords>
                <term>funerary</term>
              </keywords>
            </textClass>
          </profileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getType(xml)).toBe("funerary");
  });

  it("should return undefined when the term element is missing", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <profileDesc>
            <textClass>
              <keywords>
                <otherElement>TestType</otherElement>
              </keywords>
            </textClass>
          </profileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getType(xml)).toBeUndefined();
  });
});

describe("getObjectType function", () => {
  it("should return the object type when it exists", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <physDesc>
                  <objectDesc>
                    <supportDesc>
                      <support>
                        <objectType>stone</objectType>
                      </support>
                    </supportDesc>
                  </objectDesc>
                </physDesc>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getObjectType(xml)).toBe("stone");
  });

  it("should return undefined when objectType is missing", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <physDesc>
                  <objectDesc>
                    <supportDesc>
                      <support></support>
                    </supportDesc>
                  </objectDesc>
                </physDesc>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getObjectType(xml)).toBeUndefined();
  });

  it("should return undefined when the XML structure is incomplete", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <physDesc>
                  <objectDesc></objectDesc>
                </physDesc>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getObjectType(xml)).toBeUndefined();
  });

  it("should return undefined when the entire physDesc section is missing", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc></msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getObjectType(xml)).toBeUndefined();
  });
});

describe("getMaterial function", () => {
  it("should return the material when it exists", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <physDesc>
                  <objectDesc>
                    <supportDesc>
                      <support>
                        <material>stone</material>
                      </support>
                    </supportDesc>
                  </objectDesc>
                </physDesc>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getMaterial(xml)).toBe("stone");
  });

  it("should return undefined when material is missing", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <physDesc>
                  <objectDesc>
                    <supportDesc>
                      <support></support>
                    </supportDesc>
                  </objectDesc>
                </physDesc>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getMaterial(xml)).toBeUndefined();
  });

  it("should return undefined when the XML structure is incomplete", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <physDesc>
                  <objectDesc></objectDesc>
                </physDesc>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getMaterial(xml)).toBeUndefined();
  });

  it("should return undefined when the entire physDesc section is missing", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc></msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getMaterial(xml)).toBeUndefined();
  });
});

describe("getDates function", () => {
  it("should return complete date information when origDate is present", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <history>
                  <origin>
                    <origDate notBefore-custom="0100" notAfter-custom="0200" evidence="lettering" precision="low">First to second century CE</origDate>
                  </origin>
                </history>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getDates(xml)).toEqual({
      _: "First to second century CE",
      notBefore: 100,
      notAfter: 200,
      evidence: "lettering",
      precision: "low",
    });
  });

  it("should return null values when origDate is not present", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <history>
                  <origin></origin>
                </history>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getDates(xml)).toEqual({
      notBefore: null,
      notAfter: null,
    });
  });

  it("should handle partial date information", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <history>
                  <origin>
                    <origDate notBefore-custom="0100" evidence="lettering">Early second century CE</origDate>
                  </origin>
                </history>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getDates(xml)).toEqual({
      _: "Early second century CE",
      notBefore: 100,
      notAfter: null,
      evidence: "lettering",
      precision: undefined,
    });
  });

  it("should handle non-numeric values for notBefore-custom and notAfter-custom", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <history>
                  <origin>
                    <origDate notBefore-custom="abc" notAfter-custom="def">Invalid date</origDate>
                  </origin>
                </history>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getDates(xml)).toEqual({
      _: "Invalid date",
      notBefore: NaN,
      notAfter: NaN,
      evidence: undefined,
      precision: undefined,
    });
  });

  it("should handle empty string values for notBefore-custom and notAfter-custom", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <history>
                  <origin>
                    <origDate notBefore-custom="" notAfter-custom="">Undated inscription</origDate>
                  </origin>
                </history>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getDates(xml)).toEqual({
      _: "Undated inscription",
      notBefore: null,
      notAfter: null,
      evidence: undefined,
      precision: undefined,
    });
  });
});

describe("getPlaces function", () => {
  it("should return correct places when origin has offset with modern placeName", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <history>
                  <origin>
                    <origPlace>
                      <offset>near <placeName type="modern">Syracuse</placeName></offset>
                      <geo>1, 1</geo>
                    </origPlace>
                  </origin>
                </history>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    const result = metadataExtractors.getPlaces(xml);
    expect(result.places).toHaveLength(1);
    expect(result.geo).toEqual([[1, 1]]);
    expect(result.places[0]).toEqual({
      type: "modern",
      _: "Syracuse",
      offset: "near",
    });
  });

  it("should return correct places when origin has both ancient and modern placeName", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <history>
                  <origin>
                    <origPlace>
                      <placeName type="ancient">Syracusae</placeName>
                      <placeName type="modern">Syracuse</placeName>
                      <geo>1, 1</geo>
                    </origPlace>
                  </origin>
                </history>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    const result = metadataExtractors.getPlaces(xml);
    expect(result.places).toHaveLength(2);
    expect(result.geo).toEqual([[1, 1]]);
    expect(result.places[0]).toEqual({ type: "ancient", _: "Syracusae" });
    expect(result.places[1]).toEqual({ type: "modern", _: "Syracuse" });
  });

  it("should return empty places array when no origPlace is present", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <history>
                  <origin>
                  </origin>
                </history>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    const result = metadataExtractors.getPlaces(xml);
    expect(result.places).toHaveLength(0);
    expect(result.geo).toBeNull();
  });
});

describe("getFacsimile function", () => {
  it("should return null when facsimile is not present", async () => {
    const xml = await createXmlObject(`
      <TEI>
      </TEI>
    `);

    expect(metadataExtractors.getFacsimile(xml)).toBeNull();
  });

  it("should return facsimile data when surface is not an array", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <facsimile>
          <surface>
            <graphic url="image.tif" desc="Sample description"/>
            <graphic url="image.jpg" desc="Sample description"/>
          </surface>
        </facsimile>
      </TEI>
    `);

    expect(metadataExtractors.getFacsimile(xml)).toEqual({
      url: "image.tif",
      desc: "Sample description",
    });
  });

  it("should return null when no .tif file is found", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <facsimile>
          <surface>
            <graphic url="image.jpg" desc="JPEG image"/>
            <graphic url="image.jpg" desc="JPEG image"/>
          </surface>
        </facsimile>
      </TEI>
    `);

    expect(metadataExtractors.getFacsimile(xml)).toBeNull();
  });

  it("should return first .tif file when multiple are present", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <facsimile>
          <surface>
            <graphic url="image1.tif" desc="TIF 1"/>
            <graphic url="image2.tif" desc="TIF 2"/>
          </surface>
        </facsimile>
      </TEI>
    `);

    expect(metadataExtractors.getFacsimile(xml)).toEqual({
      url: "image1.tif",
      desc: "TIF 1",
    });
  });
});

describe("getMsIdentifier function", () => {
  it("should handle empty strings for all properties", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <msIdentifier>
                  <country></country>
                  <region> </region>
                  <settlement>   </settlement>
                  <repository></repository>
                </msIdentifier>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getMsIdentifier(xml)).toEqual({
      country: "",
      region: "",
      settlement: "",
      repository: "",
    });
  });

  it("should handle missing properties", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <msIdentifier>
                  <country>Italy</country>
                  <settlement>Rome</settlement>
                </msIdentifier>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getMsIdentifier(xml)).toEqual({
      country: "Italy",
      region: undefined,
      settlement: "Rome",
      repository: undefined,
    });
  });

  it("should handle completely empty msIdentifier", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <msIdentifier>
                </msIdentifier>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);

    expect(metadataExtractors.getMsIdentifier(xml)).toEqual({
      country: undefined,
      region: undefined,
      settlement: undefined,
      repository: undefined,
    });
  });
});

describe("getTextLang function", () => {
  it("should return the textLang object when it exists", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <msContents>
                  <textLang mainLang="la">Latin</textLang>
                </msContents>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);
    expect(metadataExtractors.getTextLang(xml)).toEqual({
      _: "Latin",
      languages: ["Latin"],
      mainLang: "la",
    });
  });

  it("should return undefined when textLang doesn't exist", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <msContents>
                </msContents>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);
    expect(metadataExtractors.getTextLang(xml)).toBeNull();
  });

  it("should return the textLang object with only mainLang", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <msContents>
                  <textLang mainLang="grc"/>
                </msContents>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);
    expect(metadataExtractors.getTextLang(xml)).toEqual({
      mainLang: "grc",
      languages: ["Ancient Greek"],
    });
  });

  it("should return an empty object when textLang is present but empty", async () => {
    const xml = await createXmlObject(`
      <TEI>
        <teiHeader>
          <fileDesc>
            <sourceDesc>
              <msDesc>
                <msContents>
                  <textLang/>
                </msContents>
              </msDesc>
            </sourceDesc>
          </fileDesc>
        </teiHeader>
      </TEI>
    `);
    expect(metadataExtractors.getTextLang(xml)).toBeNull();
  });
});

describe("getKeywords function", () => {
  it("should handle null values by filtering them out", () => {
    const metadata = {
      uri: null,
      title: "Test Title",
    };
    const keywords = metadataExtractors.getKeywords(metadata);
    expect(keywords).not.toContain(null);
    expect(keywords).toContain("test title");
  });

  it("should handle undefined values by filtering them out", () => {
    const metadata = {
      uri: undefined,
      title: "Test Title",
    };
    const keywords = metadataExtractors.getKeywords(metadata);
    expect(keywords).not.toContain(undefined);
    expect(keywords).toContain("test title");
  });

  it("should handle a mix of string and non-string values correctly", () => {
    const metadata = {
      uri: "http://example.com",
      title: "Test Title",
      status: "draft",
      notBefore: 100,
      notAfter: 200,
      places: [{ _: "Place1" }, { _: "Place2" }],
      country: "Country",
      region: null,
      settlement: undefined,
      repository: { _: "Repository" },
      textLang: { _: "Language", mainLang: "lang" },
    };
    const keywords = metadataExtractors.getKeywords(metadata);
    expect(keywords).toEqual([
      "http://example.com",
      "test title",
      "draft",
      "100",
      "200",
      "place1",
      "place2",
      "country",
      "repository",
      "language",
      "lang",
    ]);
  });
});
