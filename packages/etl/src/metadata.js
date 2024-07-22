import xml2js from "xml2js";

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
    type: getType(xml),
    objectType: getObjectType(xml),
    material: getMaterial(xml),
    layoutDesc: getLayoutDesc(xml),
    ...getDates(xml),
    ...getPlaces(xml),
    facsimile: getFacsimile(xml),
    ...getMsIdentifier(xml),
    textLang: getTextLang(xml),
  };

  metadata.placeName = metadata.places[0]?._;
  metadata.keywords = getKeywords(metadata);

  delete metadata.repository;

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
  return xml.TEI.teiHeader.fileDesc?.publicationStmt?.idno?.filter(
    (idno) => idno.type === "URI"
  )[0]?._;
}

function getTitle(xml) {
  return xml.TEI.teiHeader.fileDesc.titleStmt.title?.trim();
}

function getStatus(xml) {
  return xml.TEI.teiHeader.revisionDesc.status;
}

function getType(xml) {
  return xml.TEI.teiHeader.profileDesc.textClass?.keywords?.term;
}

function getObjectType(xml) {
  return xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
    ?.supportDesc?.support?.objectType;
}

function getMaterial(xml) {
  return xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
    ?.supportDesc?.support?.material;
}

function getLayoutDesc(xml) {
    return xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.physDesc?.objectDesc
    ?.layoutDesc?.layout?.rs;

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

  return {
    places,
    geo: origPlace?.geo
      ?.split(",")
      .map((g) => g.trim())
      .map((g) => parseInt(g)),
  };
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
    repository: msIdentifier.repository,
  };
}

function getTextLang(xml) {
  return xml.TEI.teiHeader.fileDesc.sourceDesc.msDesc.msContents.textLang;
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
  getDates,
  getPlaces,
  getFacsimile,
  getMsIdentifier,
  getTextLang,
  getKeywords,
};
