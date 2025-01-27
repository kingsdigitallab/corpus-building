import xml2js from "xml2js";
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
    type: getType(xml),
    support: getSupport(xml),
    objectType: getObjectType(xml),
    material: getMaterial(xml),
    condition: getCondition(xml),
    dimensions: getDimensions(xml),
    layoutDesc: getLayoutDesc(xml),
    handNote: getHandNote(xml),
    ...getDates(xml),
    ...getPlaces(xml),
    provenanceFound: getProvenance(xml, "found"),
    provenanceObserved: getProvenance(xml, "observed"),
    provenanceLost: getProvenance(xml, "not-observed", "lost"),
    facsimile: getFacsimile(xml),
    ...getMsIdentifier(xml),
    textLang: getTextLang(xml),
    bibliographyEdition: await getBibliography(xml, "edition"),
    bibliographyDiscussion: await getBibliography(xml, "discussion"),
  };

  metadata.provenance = metadata.places[0]?._;

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

async function parseXML(xmlString) {
  const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
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
    notBefore: origDate["notBefore-custom"]
      ? parseInt(origDate["notBefore-custom"])
      : null,
    notAfter: origDate["notAfter-custom"]
      ? parseInt(origDate["notAfter-custom"])
      : null,
    evidence: origDate.evidence,
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

function getFacsimile(xml) {
  let surface = xml.TEI.facsimile?.surface;

  if (surface && Array.isArray(surface)) {
    surface = surface[0];
  }

  const facsimile = surface?.graphic?.find((g) => g.url.endsWith(".tif"));

  return facsimile ? { url: facsimile.url, desc: facsimile.desc } : null;
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

  const url = `https://api.zotero.org/groups/382445/items/${itemKey}?format=json&include=citation,data&style=chicago-fullnote-bibliography`;

  return fetch(url)
    .then((response) => (response.ok ? response.json() : null))
    .then((json) => {
      const data = {
        title: json.data.title?.trim() || "",
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
  getFacsimile,
  getMsIdentifier,
  getTextLang,
  getKeywords,
};
