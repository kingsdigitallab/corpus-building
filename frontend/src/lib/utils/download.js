import JSZip from 'jszip';
import { base } from '$app/paths';

/**
 * Creates and downloads a CSV file from inscription data
 *
 * @param {string} summary - The summary of the search
 * @param {Array<{ file: string; tmNumber: string; title: string; notBefore: number; notAfter: number; places: Array<{ offset: string; _: string; type: string; }>; status: { _: string; }; type: { _: string; }; objectType: { _: string; }; language: { _: string; }; settlement: { _: string; }; }>} inscriptions - Array of inscription objects
 */
export async function downloadInscriptionsCSV(summary, inscriptions) {
	const headers = [
		'ID',
		'TM Number',
		'Date notBefore',
		'Date notAfter',
		'Origin (ancient)',
		'Origin (modern)',
		'Origin latitude',
		'Origin longitude',
		'Provenance latitude',
		'Provenance longitude',
		'Material',
		'Object type',
		'Type',
		'Execution type 1',
		'Execution type 2',
		'Language',
		'Repository name',
		'Inventory number'
	].join(',');

	const rows = inscriptions
		.map((inscription) => {
			return [
				inscription.file,
				`"${inscription?.tmNumber || ''}"`,
				inscription?.notBefore || '',
				inscription?.notAfter || '',
				`"${getInscriptionPlace(inscription, 'ancient')}"`,
				`"${getInscriptionPlace(inscription, 'modern')}"`,
				inscription.geo?.[0]?.[0] || '',
				inscription.geo?.[0]?.[1] || '',
				inscription.provenanceGeo?.[0] || '',
				inscription.provenanceGeo?.[1] || '',
				`${inscription.material?.at(-1).replaceAll(':::', '.') || ''}`,
				`"${getInscriptionObjectType(inscription)}"`,
				`"${getInscriptionType(inscription)}"`,
				`"${inscription.technique?.at(-1)?.replaceAll(':::', '.') || ''}"`,
				`"${inscription.pigment?.at(-1)?.replaceAll(':::', '.') || ''}"`,
				`"${getInscriptionLanguage(inscription)}"`,
				`"${inscription.repository.at(-1)?.split(':::').at(-1) || ''}"`,
				`"${inscription.idno?._ || ''}"`
			].join(',');
		})
		.join('\n');

	const a = document.createElement('a');
	a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(`"${summary}"\n${headers}\n${rows}`)}`;
	a.download = 'inscriptions.csv';
	a.click();
	a.remove();
}

/**
 * @param {any} inscription
 * @param {string} type
 */
function getInscriptionPlace(inscription, type) {
	return inscription?.places?.find((place) => place.type === type)?._ || '';
}

/**
 * @param {{ type: { _: string; }; }} inscription
 */
function getInscriptionType(inscription) {
	return inscription.type?._?.trim() || 'N/A';
}

/**
 * @param {{ rawObjectType: { _: string; }; }} inscription
 */
function getInscriptionObjectType(inscription) {
	return inscription.rawObjectType?._ || 'N/A';
}

/**
 * @param {{ textLang: { _: string; }; }} inscription
 */
function getInscriptionLanguage(inscription) {
	return inscription.textLang?._ || 'N/A';
}

/**
 * @param {{ settlement: string; }} inscription
 */
function getInscriptionSettlement(inscription) {
	return inscription.settlement || 'N/A';
}

/**
 * Creates and downloads a ZIP file from inscription XML files
 *
 * @param {string} summary - The summary of the search
 * @param {Array<{ file: string; title: string; notBefore: number; notAfter: number; places: Array<{ offset: string; _: string; type: string; }>; status: { _: string; }; type: { _: string; }; objectType: { _: string; }; language: { _: string; }; settlement: { _: string; }; }>} inscriptions - Array of inscription objects
 */
export async function downloadInscriptionsXML(summary, inscriptions) {
	const zip = new JSZip();

	zip.file('summary.txt', summary);

	for (const inscription of inscriptions) {
		try {
			const response = await fetch(`${base}/api/inscription/${inscription.file}.xml`);
			if (!response.ok) {
				console.warn(`Failed to fetch XML for ${inscription.file}`);
				continue;
			}
			const xmlContent = await response.text();
			zip.file(`${inscription.file}.xml`, xmlContent);
		} catch (error) {
			console.error(`Error fetching XML for ${inscription.file}:`, error);
		}
	}

	const content = await zip.generateAsync({ type: 'blob' });

	const a = document.createElement('a');
	a.href = URL.createObjectURL(content);
	a.download = 'inscriptions.zip';
	a.click();
	a.remove();

	URL.revokeObjectURL(a.href);
}
