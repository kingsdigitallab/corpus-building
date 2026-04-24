import xml2js from "xml2js";
import museums from "../../../data/processed/museums.json" with { type: "json" };
import zotero from "../../../data/processed/zotero.json" with { type: "json" };

/**
 * Extracts metadata from an XML string.
 *
 * @async
 * @function extractMetadata
 * @param {string} xmlString - The XML content as a string.
 * @returns {Promise<Object>} A promise that resolves to an object containing the extracted metadata.
 * @property {string} title - The title extracted from the XML.
 * @throws {Error} If there's an error parsing the XML.
 */
export async function extractMetadata(xmlString) {
  const xml = await parseXML(xmlString);
  if (!xml) return {};

  const metadata = {
    uri: getURI(xml),
    title: getTitle(xml),
    status: getStatus(xml),
    editions: getEditions(xml),
    editionAuthor: await getEditionAuthor(xml),
    type: getType(xml),
    support: getSupport(xml),
    objectType: getObjectType(xml),
    material: getMaterial(xml),
    condition: getCondition(xml),
    dimensions: getDimensions(xml),
    layoutDesc: getLayoutDesc(xml),
    handNote: getHandNote(xml),
    date: getDates(xml),
    ...getPlaces(xml),
    country: undefined,
    provenance: undefined,
    provenanceFound: getProvenance(xml, "found"),
    provenanceGeo: undefined,
    provenanceObserved: getProvenance(xml, "observed"),
    provenanceLost: getProvenance(xml, "not-observed", "lost"),
    graphics: getGraphics(xml),
    ...getMsIdentifier(xml),
    textLang: getTextLang(xml),
    bibliographyEdition: await getBibliography(xml, "edition"),
    bibliographyDiscussion: await getBibliography(xml, "discussion"),
    citation: getCitation(xml),
  };

  metadata.tmNumber =
    metadata.editions.find((edition) => edition.type === "TM")?._ || "";
  metadata.facsimile = metadata.graphics[0];
  metadata.country = metadata.places[0]?.region;
  metadata.provenance = metadata.places[0]?._;
  metadata.provenanceGeo = metadata.provenanceFound?.geo || [];

  metadata.letterHeights = metadata.handNote?.dimensions
    .filter((d) => d?.quantity || (d?.atLeast && d?.atMost))
    .map((d) => ({
      atLeast: Number.parseInt(d?.quantity || d.atLeast, 10),
      atMost: Number.parseInt(d?.quantity || d.atMost, 10),
    }));

  const bibliography = Array.isArray(metadata.bibliographyEdition?.bibl)
    ? metadata.bibliographyEdition?.bibl
    : [metadata.bibliographyEdition?.bibl];

  metadata.publications = bibliography
    .filter((b) => b)
    .map((b) => {
      const author = b.author;
      const title = b.type === "corpus" ? b.n : b.title;
      const year = b.date;

      let publication = "";

      if (author) {
        publication = author;
        if (year) {
          publication += `, ${year}`;
        }
        if (title) {
          publication += `, ${title}`;
        }
      } else {
        publication = title;
        if (year) {
          publication += `, ${year}`;
        }
      }

      return publication;
    });

  metadata.zotero = bibliography
    .filter((b) => b?.ptr?.target?.includes("zotero"))
    .map((b) => sanitizeURL(b.ptr.target).split("/").at(-1));
  metadata.keywords = getKeywords(metadata);

  return metadata;
}

/**
 * @param {string | xml2js.convertableToString} xmlString
 * @param {Object} options https://github.com/Leonidas-from-XIV/node-xml2js?tab=readme-ov-file#options
 * @param {boolean} options.explicitArray
 * @param {boolean} options.mergeAttrs
 * @returns {Promise<Object>}
 */
export async function parseXML(
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
 * Removes all whitespace from a URL string.
 * Raw XML attributes may contain leading, trailing, or embedded spaces.
 *
 * @param {string | undefined} url
 * @returns {string | undefined}
 */
function sanitizeURL(url) {
  return url?.replace(/\s+/g, "");
}

function getURI(xml) {
  return xml.TEI.teiHeader.fileDesc?.publicationStmt?.idno
    ?.filter((idno) => idno.type === "URI")[0]
    ?._.split("/")
    .at(-1);
}

function getTitle(xml) {
  return xml.TEI.teiHeader.fileDesc.titleStmt.title?.trim();
}

function getStatus(xml) {
  const status = xml.TEI.teiHeader.revisionDesc.status;

  if (status?.toLowerCase() === "deprecated") {
    const changeNote = getChangeNote(xml, status);
    return {
      _: status,
      changeNote,
    };
  }

  return { _: status };
}

function getChangeNote(xml, status) {
  const changes = xml.TEI.teiHeader.revisionDesc.listChange.change;

  if (!changes) return null;

  return changes.find((change) => change["xml:id"] === status);
}

function getEditions(xml) {
  return xml.TEI.teiHeader.fileDesc.publicationStmt.idno?.filter((idno) =>
    ["TM", "EDR", "EDH", "EDCS", "PHI"].includes(idno.type),
  );
}
async function getEditionAuthor(xml) {
  const edition = xml.TEI.text.body.div.find((div) => div.type === "edition");

  if (!edition) return null;

  let source = edition.source;

  if (!source) return null;

  if (source.includes("zotero")) {
    source = source.replace(/^#/, "");

    const itemKey = source.split("/").at(-1);
    const zoteroData = await getZoteroData(itemKey);
    if (zoteroData) {
      zoteroData.ref = source;
    }
    return zoteroData;
  }

  const respStmt = xml.TEI.teiHeader.fileDesc.titleStmt.respStmt;

  if (!respStmt) return null;

  const respStmts = Array.isArray(respStmt) ? respStmt : [respStmt];

  const author = respStmts.find(
    (rs) => rs.name?.["xml:id"] === source.split("#").at(-1),
  );

  if (!author) return null;

  return author;
}

function getType(xml) {
  return xml.TEI.teiHeader.profileDesc.textClass?.keywords?.term;
}

function getSupport(xml) {
  return xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
    ?.supportDesc?.support?.p;
}

function getObjectType(xml) {
  const objectType =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
      ?.supportDesc?.support?.objectType;

  const result = Array.isArray(objectType) ? objectType[0] : objectType;

  if (result?.ref) result.ref = sanitizeURL(result.ref);

  return result;
}

function getMaterial(xml) {
  let ret = xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
    ?.supportDesc?.support?.material;
  
  // convert the pipe separated list of values in the string into an array
  if (ret) {
    ret.subtype = ((ret?.subtype || '').split("|").map((g) => g.trim())).filter(g => g)
  }

  return ret
}

function getCondition(xml) {
  return xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
    ?.supportDesc?.condition;
}

function getDimensions(xml) {
  const dimensions =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
      ?.supportDesc?.support?.dimensions;

  if (!dimensions) return [];

  return Object.entries(dimensions).map(([key, value]) => ({
    ...value,
    dimension: key,
  }));
}

function getLayoutDesc(xml) {
  return xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
    ?.layoutDesc;
}

function getHandNote(xml) {
  const handNote =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.handDesc?.handNote;

  const lettering = handNote?.p;

  let handNoteDimensions = handNote?.dimensions;
  let handNoteLocus = handNote?.locus;

  if (handNoteDimensions && !Array.isArray(handNoteDimensions)) {
    handNoteDimensions = [handNoteDimensions];
    handNoteLocus = [handNoteLocus];
  }

  const dimensions = ["letterHeight", "interlinear"].flatMap((dimensionType) =>
    handNoteDimensions
      ?.map((dim, idx) => ({ ...dim, locus: handNoteLocus[idx] }))
      .filter((dim) => dim.type === dimensionType)
      .map((dim) => {
        const { _: heightText, ...height } = dim?.height || {};
        const { _: locusText, ...locus } = dim?.locus || {};

        return {
          type: dimensionType,
          l: locusText,
          ...locus,
          h: heightText,
          ...height,
        };
      }),
  );

  return { lettering, dimensions };
}

function getDates(xml) {
  const origDate =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.history.origin.origDate;

  if (!origDate) return { notBefore: null, notAfter: null };

  return {
    _: origDate._,
    notBefore: origDate["notBefore-custom"]
      ? Number.parseInt(origDate["notBefore-custom"])
      : null,
    notAfter: origDate["notAfter-custom"]
      ? Number.parseInt(origDate["notAfter-custom"])
      : null,
    evidence: origDate.evidence?.replaceAll(" ", ", "),
    precision: origDate.precision,
  };
}

function getPlaces(xml) {
  const origPlace =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.history.origin.origPlace;

  if (!origPlace) return { places: [], geo: null };

  const region = origPlace.region;
  const places = [];

  for (const placeType of ["ancient", "modern"]) {
    let place;

    if (Array.isArray(origPlace.placeName)) {
      place = origPlace.placeName.find((p) => p.type === placeType);
    } else if (origPlace.placeName?.type === placeType) {
      place = origPlace.placeName;
    } else if (
      origPlace.offset &&
      origPlace.offset.placeName?.type === placeType
    ) {
      place = origPlace.offset.placeName;
      place.offset = origPlace.offset._.trim();
    }

    if (place?._) {
      place.region = region;
      places.push(place);
    }
  }

  let geo = origPlace?.geo || [];

  if (!Array.isArray(geo)) {
    geo = [geo];
  }

  return {
    places,
    geo: geo?.map((g) =>
      g
        .split(",")
        .map((g) => g.trim())
        .map((g) => Number.parseFloat(g)),
    ),
  };
}

/**
 * Retrieves provenance information from the XML data.
 *
 * @function getProvenance
 * @param {Object} xml - The parsed XML data.
 * @param {string} provenanceType - The type of provenance to retrieve.
 * @param {string | null | undefined} [subtype=null] - The subtype of provenance to retrieve.
 * @returns {Object|null} The provenance information if found, or null if not found.
 */
function getProvenance(xml, provenanceType, subtype = null) {
  const provenance =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc?.history?.provenance;

  if (!provenance) return null;

  // Convert to array if single element
  const provenanceArray = Array.isArray(provenance) ? provenance : [provenance];

  const found = provenanceArray.find(
    (p) => p.type === provenanceType && (!subtype || p.subtype === subtype),
  );

  if (!found) return null;

  // geo can either be a string or an object in the format { _: '37.967227, 13.198435', cert: 'medium' }
  let geo = found.geo;
  if (geo?.cert) {
    found.geoCert = geo.cert;
    geo = geo._;
  }
  geo = geo?.split(",").map((g) => Number.parseFloat(g.trim()));

  if (
    geo &&
    geo.length === 2 &&
    geo[0] >= -180 &&
    geo[0] <= 180 &&
    geo[1] >= -90 &&
    geo[1] <= 90
  ) {
    found.geo = geo;
  } else {
    found.geo = null;
  }

  return found;
}

function getGraphics(xml) {
  let surfaces = xml.TEI.facsimile?.surface;

  if (!surfaces) return [];
  if (surfaces && !Array.isArray(surfaces)) {
    surfaces = [surfaces];
  }

  const graphics = surfaces.flatMap(
    (/** @type {{ graphic: any[]; desc: string; type: string; }} */ surface) =>
      surface.graphic
        ?.map((graphic) => {
          return {
            ...graphic,
            url: sanitizeURL(graphic.url),
            desc: graphic.desc,
            surfaceType: surface.type,
          };
        })
        .filter((image) => image.n === "screen"),
  );

  return graphics;
}

function getMsIdentifier(xml) {
  const msIdentifier =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.msIdentifier;

  if (!msIdentifier)
    return { country: null, region: null, settlement: null, repository: null };

  return {
    country: getText(msIdentifier.country),
    region: getText(msIdentifier.region),
    settlement: getText(msIdentifier.settlement),
    repository: getRepository(msIdentifier),
    idno: msIdentifier.idno,
  };
}

function getText(node) {
  if (node === undefined) return undefined;
  if (node === null) return null;
  if (typeof node === "string") return node.trim();
  if (Array.isArray(node)) return getText(node[0]);
  return node._?.trim();
};

function getRepository(msIdentifier) {
  const ref = sanitizeURL(msIdentifier.repository?.ref);

  if (!ref) return msIdentifier.repository;

  const museum = museums.find((m) => m.uri === ref);

  if (!museum) return { ...msIdentifier.repository, ref };

  return {
    _: museum.name,
    role: museum.type,
    ref: museum.uri,
    museum,
  };
}

function getTextLang(xml) {
  const textLang =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.msContents.textLang;

  if (!textLang) return null;

  const otherLangs = textLang.otherLangs
    ? textLang.otherLangs.split(" ").map(getLangName)
    : [];

  let certainty = textLang.certainty || [];

  if (certainty && !Array.isArray(certainty)) {
    certainty = [certainty];
  }

  const possibleLangs = certainty.map(
    (certainty) => `${getLangName(certainty.assertedValue)} (possibly)`,
  );

  textLang.languages = [
    getLangName(textLang.mainLang),
    ...otherLangs,
    ...possibleLangs,
  ];

  return textLang;
}

function getLangName(langCode) {
  const langMap = {
    cms: "Messapic",
    grc: "Ancient Greek",
    he: "Hebrew",
    heb: "Hebrew",
    la: "Latin",
    osc: "Oscan",
    scx: "Sikel",
    xly: "Elymian",
    xpu: "Punic",
  };

  return langMap[langCode] || langCode;
}

async function getBibliography(xml, bibliographyType = "edition") {
  let bibliography = xml.TEI.text.body.div.find(
    (div) => div.type === "bibliography",
  )?.listBibl;

  if (!bibliography) return [];

  if (!Array.isArray(bibliography)) {
    bibliography = [bibliography];
  }

  const items = bibliography.find(
    (listBibl) => listBibl.type === bibliographyType,
  );

  if (!items) return {};

  if (!Array.isArray(items.bibl)) {
    items.bibl = [items.bibl];
  }

  items.bibl = await Promise.all(
    items.bibl.map(
      async (
        /** @type {{ ptr: { target: string; }; } & Record<string, any>} */ item,
      ) => {
        if (item.ptr?.target) {
          const zoteroData = await getZoteroData(
            sanitizeURL(item.ptr.target).split("/").at(-1),
          );

          return {
            ...item,
            inscriptionDate: item?.date,
            ...zoteroData,
            year: zoteroData?.date?.match(/\d{4}/)?.[0] || ''
          };
        }
      },
    ),
  );

  return items;
}

async function getZoteroData(itemKey) {
  if (!itemKey) return Promise.resolve("");

  if (zotero?.[itemKey]) {
    return Promise.resolve(zotero[itemKey]);
  }

  console.warn(`Zotero data not found for key: ${itemKey}`);
  return Promise.resolve(null);
}

async function getXML(xmlString) {
  return xmlString;
}

function getCitation(xml) {
  const titleStmt = xml.TEI.teiHeader.fileDesc.titleStmt;
  const revisionDesc = xml.TEI.teiHeader.revisionDesc;

  if (!titleStmt) return null;

  const editor = titleStmt.editor;
  const principal = titleStmt.principal;
  const contributors = Array.isArray(titleStmt?.respStmt)
    ? titleStmt.respStmt.map((rs) => rs.name)
    : [titleStmt.respStmt?.name] || [];

  const change = Array.isArray(revisionDesc?.listChange?.change)
    ? revisionDesc.listChange.change.at(-1)
    : revisionDesc?.listChange?.change || null;

  return { editor, principal, contributors, change };
}

function getKeywords(metadata) {
  return [
    metadata.uri,
    metadata.title,
    metadata.status,
    metadata.type?._,
    metadata.objectType?._,
    metadata.material?._,
    metadata.notBefore?.toString(),
    metadata.notAfter?.toString(),
    metadata.places?.[0]?._,
    metadata.places?.[1]?._,
    metadata.country,
    metadata.region,
    metadata.settlement,
    metadata.repository?._,
    metadata.textLang?._,
    metadata.textLang?.mainLang,
  ]
    .filter((keyword) => keyword)
    .map((keyword) =>
      typeof keyword === "string" ? keyword.trim().toLowerCase() : keyword,
    );
}

export const metadataExtractors = {
  parseXML,
  getURI,
  getTitle,
  getStatus,
  getType,
  getObjectType,
  getMaterial,
  getDimensions,
  getLayoutDesc,
  getHandNote,
  getDates,
  getPlaces,
  getFacsimile: getGraphics,
  getMsIdentifier,
  getTextLang,
  getKeywords,
};
