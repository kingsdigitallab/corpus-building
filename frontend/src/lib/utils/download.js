/**
 * Creates and downloads a CSV file from inscription data
 * @param {Array<any>} inscriptions - Array of inscription objects
 */
export function downloadInscriptionsCSV(inscriptions) {
	const csv = inscriptions
		.map((inscription) => {
			return `${inscription.file},${inscription.title},${inscription.notBefore},${inscription.notAfter},${inscription.places},${inscription.status},${inscription.type},${inscription.objectType},${inscription.language},${inscription.settlement}`;
		})
		.join('\n');

	const headers =
		'inscription,title,not before,not after,places,status,type,object type,language,settlement\n';
	const a = document.createElement('a');
	a.href = `data:text/csv;charset=utf-8,${encodeURIComponent(headers + csv)}`;
	a.download = 'inscriptions.csv';
	a.click();
	a.remove();
}
