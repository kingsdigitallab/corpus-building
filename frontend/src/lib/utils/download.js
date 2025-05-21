/**
 * Creates and downloads a CSV file from inscription data
 *
 * @param {string} summary - The summary of the search
 * @param {Array<{ file: string; title: string; notBefore: number; notAfter: number; places: Array<{ offset: string; _: string; type: string; }>; status: { _: string; }; type: { _: string; }; objectType: { _: string; }; language: { _: string; }; settlement: { _: string; }; }>} inscriptions - Array of inscription objects
 */
export function downloadInscriptionsCSV(summary, inscriptions) {
	const headers =
		'ID,Title,"Not before","No earlier than","No later than",Place,Status,Type,Object type,Language,Settlement\n';

	const rows = inscriptions
		.map((inscription) => {
			return [
				inscription.file,
				`"${inscription.title}"`,
				inscription.notBefore,
				inscription.notAfter,
				`"${getInscriptionPlace(inscription)}"`,
				inscription.status._,
				`"${getInscriptionType(inscription)}"`,
				`"${getInscriptionObjectType(inscription)}"`,
				`"${getInscriptionLanguage(inscription)}"`,
				`"${getInscriptionSettlement(inscription)}"`
			].join(',');
		})
		.join('\n');

	const a = document.createElement('a');
	a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(`"${summary}"\n${headers}${rows}`)}`;
	a.download = 'inscriptions.csv';
	a.click();
	a.remove();
}

/**
 * @param {any} inscription
 */
function getInscriptionPlace(inscription) {
	return inscription.places
		.map((/** @type {{ offset: string; _: string; type: string; }} */ place) => {
			let placeString = '';
			if (place.offset) {
				placeString += `${place.offset} `;
			}
			placeString += `${place._}`;
			placeString += `(${place.type})`;
			return placeString;
		})
		.join(', ');
}

/**
 * @param {{ type: { _: string; }; }} inscription
 */
function getInscriptionType(inscription) {
	return inscription.type?._ || 'N/A';
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
