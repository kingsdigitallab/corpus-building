/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
	const response = await fetch('/src/data/corpus.json');
	const metadata = await response.json();

	return { metadata };
}
