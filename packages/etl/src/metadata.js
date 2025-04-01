import xml2js, { Builder } from "xml2js";
import museums from "../../../data/processed/museums.json" assert { type: "json" };

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
    provenanceFound: getProvenance(xml, "found"),
    provenanceObserved: getProvenance(xml, "observed"),
    provenanceLost: getProvenance(xml, "not-observed", "lost"),
    graphics: getGraphics(xml),
    ...getMsIdentifier(xml),
    textLang: getTextLang(xml),
    bibliographyEdition: await getBibliography(xml, "edition"),
    bibliographyDiscussion: await getBibliography(xml, "discussion"),
  };

  metadata.facsimile = metadata.graphics[0];
  metadata.provenance = metadata.places[0]?._;

  metadata.letterHeights = metadata.handNote?.dimensions
    .filter((d) => d?.atLeast && d?.atMost)
    .map((d) => ({
      atLeast: parseFloat(d.atLeast),
      atMost: parseFloat(d.atMost),
    }));

  const bibliography = Array.isArray(metadata.bibliographyEdition?.bibl)
    ? metadata.bibliographyEdition?.bibl
    : [metadata.bibliographyEdition?.bibl];

  metadata.publicationAuthors = [
    ...new Set(
      bibliography
        ?.flatMap((b) => b?.author)
        .filter((a) => a)
        .map((a) => (typeof a === "string" ? a.trim() : a))
    ),
  ];

  metadata.publicationTitles = [
    ...new Set(
      bibliography
        ?.flatMap((b) => b?.title)
        .filter((a) => a)
        .map((a) => (typeof a === "string" ? a.trim() : a))
    ),
  ];

  metadata.publicationYears = [
    ...new Set(bibliography?.map((b) => b?.date).filter((a) => a)),
  ];

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
  return xml.TEI.teiHeader.revisionDesc.status;
}

function getEditions(xml) {
  return xml.TEI.teiHeader.fileDesc.publicationStmt.idno?.filter((idno) =>
    ["TM", "EDR", "EDH", "EDCS", "PHI"].includes(idno.type)
  );
}
async function getEditionAuthor(xml) {
  const edition = xml.TEI.text.body.div.find((div) => div.type === "edition");

  if (!edition) return null;

  const source = edition.source;

  if (!source) return null;

  if (source.includes("zotero")) {
    const itemKey = source.split("/").at(-1);
    const zoteroData = await getZoteroData(itemKey);
    zoteroData.ref = source;
    return zoteroData;
  }

  const respStmt = xml.TEI.teiHeader.fileDesc.titleStmt.respStmt;

  if (!respStmt) return null;

  const author = respStmt.find((rs) => rs.name["xml:id"] === source);

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
  return xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
    ?.supportDesc?.support?.objectType;
}

function getMaterial(xml) {
  return xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
    ?.supportDesc?.support?.material;
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
      })
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
      ? parseInt(origDate["notBefore-custom"])
      : null,
    notAfter: origDate["notAfter-custom"]
      ? parseInt(origDate["notAfter-custom"])
      : null,
    evidence: origDate.evidence?.replaceAll(" ", ", "),
    precision: origDate.precision,
  };
}

function getPlaces(xml) {
  const origPlace =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.history.origin.origPlace;

  if (!origPlace) return { places: [], geo: null };

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
    if (place && place._) {
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
        .map((g) => parseFloat(g))
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
    (p) => p.type === provenanceType && (!subtype || p.subtype === subtype)
  );

  if (!found) return null;

  // geo can either be a string or an object in the format { _: '37.967227, 13.198435', cert: 'medium' }
  let geo = found.geo;
  if (geo && geo.cert) {
    found.geoCert = geo.cert;
    geo = geo._;
  }
  geo = geo?.split(",").map((g) => parseFloat(g.trim()));

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
            desc: graphic.desc,
            surfaceType: surface.type,
          };
        })
        .filter((image) => image.n === "screen")
  );

  return graphics;
}

function getMsIdentifier(xml) {
  const msIdentifier =
    xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.msIdentifier;

  if (!msIdentifier)
    return { country: null, region: null, settlement: null, repository: null };

  return {
    country: msIdentifier.country?.trim(),
    region: msIdentifier.region?.trim(),
    settlement: msIdentifier.settlement?.trim(),
    repository: getRepository(msIdentifier),
    idno: msIdentifier.idno,
  };
}

function getRepository(msIdentifier) {
  const ref = msIdentifier.repository?.ref;

  if (!ref) return msIdentifier.repository;

  const museum = museums.find((m) => m.uri === ref);

  if (!museum) return msIdentifier.repository;

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

  const otherLangs = textLang.otherLangs ? textLang.otherLangs.split(" ") : [];

  textLang.languages = [
    getLangName(textLang.mainLang),
    ...otherLangs.map(getLangName),
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
    (div) => div.type === "bibliography"
  )?.listBibl;

  if (!bibliography) return [];

  if (!Array.isArray(bibliography)) {
    bibliography = [bibliography];
  }

  let items = bibliography.find(
    (listBibl) => listBibl.type === bibliographyType
  );

  if (!items) return {};

  if (!Array.isArray(items.bibl)) {
    items.bibl = [items.bibl];
  }

  items.bibl = await Promise.all(
    items.bibl.map(async (item) => {
      if (item.ptr?.target) {
        const zoteroData = await getZoteroData(
          item.ptr.target.split("/").at(-1)
        );

        item = {
          ...item,
          ...zoteroData,
        };
      }

      return item;
    })
  );

  return items;
}

const zoteroDataMap = new Map();

async function getZoteroData(itemKey) {
  const cacheKey = itemKey;

  if (!itemKey) return Promise.resolve("");
  if (zoteroDataMap.has(cacheKey)) {
    return Promise.resolve(zoteroDataMap.get(cacheKey));
  }

  let url = `https://api.zotero.org/groups/382445/items/${itemKey}?format=json&include=data`;

  let locale = "en-GB";

  const language = await fetch(url)
    .then((response) => response.json())
    .then((json) => json.data.language.toLowerCase())
    .catch(() => "english");

  if (language.indexOf("ge") === 0 || language.indexOf("german") === 0) {
    locale = "de-DE";
  } else if (
    language.indexOf("it") === 0 ||
    language.indexOf("italian") === 0
  ) {
    locale = "it-IT";
  } else if (language.indexOf("fr") === 0 || language.indexOf("french") === 0) {
    locale = "fr-FR";
  } else if (
    language.indexOf("es") === 0 ||
    language.indexOf("spanish") === 0
  ) {
    locale = "es-ES";
  }

  url = `https://api.zotero.org/groups/382445/items/${itemKey}?format=json&include=citation,data&style=chicago-fullnote-bibliography&linkwrap=1&locale=${locale}`;

  return fetch(url)
    .then((response) => (response.ok ? response.json() : null))
    .then((json) => {
      const data = {
        title: json.data.title?.trim() || "",
        date: json.data.date?.trim() || null,
        citation: json.citation.replace(".</span>", "</span>"),
      };
      zoteroDataMap.set(cacheKey, data);

      return data;
    })
    .catch(() => {
      zoteroDataMap.set(cacheKey, null);
      return null;
    });
}

async function getXML(xmlString) {
  return xmlString;
}

function getKeywords(metadata) {
  return [
    metadata.uri,
    metadata.title,
    metadata.status,
    metadata.type?._,
    metadata.objectType?._,
    metadata.material?._,
    metadata.notBefore && metadata.notBefore.toString(),
    metadata.notAfter && metadata.notAfter.toString(),
    metadata.places && metadata.places[0]?._,
    metadata.places && metadata.places[1]?._,
    metadata.country,
    metadata.region,
    metadata.settlement,
    metadata.repository?._,
    metadata.textLang?._,
    metadata.textLang?.mainLang,
  ]
    .filter((keyword) => keyword)
    .map((keyword) =>
      typeof keyword === "string" ? keyword.trim().toLowerCase() : keyword
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
