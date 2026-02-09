import JSZip from 'jszip';
import { base } from '$app/paths';

/**
 * Creates and downloads a CSV file from inscription data
 *
 * @param {string} summary - The summary of the search
 * @param {Array<{ file: string; tmNumber: string; title: string; notBefore: number; notAfter: number; places: Array<{ offset: string; _: string; type: string; }>; status: { _: string; }; type: { _: string; }; objectType: { _: string; }; language: { _: string; }; settlement: { _: string; }; }>} inscriptions - Array of inscription objects
 * @param {(progress: number, total: number) => void} [onProgress] - Optional progress callback
 */
export async function downloadInscriptionsCSV(summary, inscriptions, onProgress) {
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
		'Inventory number',
		'Edition (interpretive)',
		'Edition (diplomatic)'
	].join(',');

	// Fetch edition texts for all inscriptions
	const editionTexts = await fetchEditionTexts(inscriptions, onProgress);

	const rows = inscriptions
		.map((inscription) => {
			const editions = editionTexts.get(inscription.file) || {
				interpretive: '',
				diplomatic: ''
			};

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
				`"${inscription.idno?._ || ''}"`,
				`"${escapeCSV(editions.interpretive)}"`,
				`"${escapeCSV(editions.diplomatic)}"`
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
 * Fetches edition texts for all inscriptions
 *
 * @param {Array<{ file: string }>} inscriptions - Array of inscription objects
 * @param {(progress: number, total: number) => void} [onProgress] - Optional progress callback
 * @returns {Promise<Map<string, { interpretive: string; diplomatic: string }>>}
 */
async function fetchEditionTexts(inscriptions, onProgress) {
	const editionTexts = new Map();
	const total = inscriptions.length;

	for (let i = 0; i < inscriptions.length; i++) {
		const inscription = inscriptions[i];
		try {
			const [interpretive, diplomatic] = await Promise.all([
				fetchEditionText(inscription.file, 'interpretive'),
				fetchEditionText(inscription.file, 'diplomatic')
			]);

			editionTexts.set(inscription.file, { interpretive, diplomatic });
		} catch (error) {
			console.warn(`Failed to fetch editions for ${inscription.file}:`, error);
			editionTexts.set(inscription.file, { interpretive: '', diplomatic: '' });
		}

		if (onProgress) {
			onProgress(i + 1, total);
		}
	}

	return editionTexts;
}

/**
 * Fetches a single edition text from the API
 *
 * @param {string} slug - The inscription ID
 * @param {string} edition - The edition type (interpretive or diplomatic)
 * @returns {Promise<string>}
 */
async function fetchEditionText(slug, edition) {
	const response = await fetch(`${base}/api/inscription/${slug}/${edition}.txt`);
	if (!response.ok) {
		return '';
	}
	return response.text();
}

/**
 * Escapes a string for CSV format (handles quotes and newlines)
 *
 * @param {string} text - The text to escape
 * @returns {string}
 */
function escapeCSV(text) {
	if (!text) return '';
	// Replace newlines with spaces and escape double quotes
	return text.replace(/\n/g, ' ').replace(/"/g, '""');
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
