export const prerender = true;

/** @type {import('./$types').LayoutLoad} */
export async function load({ data, url }) {
	return {
		...data,
		url: url.pathname
	};
}
