import corpus from '../../../data/corpus.json';
import itemsjs from 'itemsjs';

/**
 * @type {itemsjs.ItemsJs<{ keywords: any; title: any; text: any; }, string, "keywords" | "title" | "text">}
 */
let searchEngine;

export const searchConfig = {
	aggregations: {
		notAfter: {
			title: 'Not after',
			hide_zero_doc_count: true,
			show_facet_stats: true,
			size: 1000,
			sort: 'key'
		},
		notBefore: {
			title: 'Not before',
			hide_zero_doc_count: true,
			show_facet_stats: true,
			size: 1000,
			sort: 'key'
		},
		language: {
			title: 'Language',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key'
		},
		provenance: {
			title: 'Provenance',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key'
		},
		inscriptionType: {
			title: 'Inscription type',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key'
		},
		objectType: {
			title: 'Object type',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key'
		},
		material: {
			title: 'Material',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key'
		},
		technique: {
			title: 'Technique',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key'
		},
		pigment: {
			title: 'Pigment',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key'
		},
		damage: {
			title: 'Damage',
			hide_zero_doc_count: true,
			size: 100,
			sort: 'key'
		},
		repository: {
			title: 'Repository',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key'
		},
		status: {
			title: 'Status',
			hide_zero_doc_count: true,
			sort: 'key'
		}
	},
	searchableFields: ['keywords', 'title', 'text'],
	sortings: {
		file_asc: {
			field: 'file',
			order: 'asc'
		},
		file_desc: {
			field: 'file',
			order: 'desc'
		},
		notAfter_asc: {
			field: 'notAfter',
			order: 'asc'
		},
		notAfter_desc: {
			field: 'notAfter',
			order: 'desc'
		},
		notBefore_asc: {
			field: 'notBefore',
			order: 'desc'
		},
		notBefore_desc: {
			field: 'notBefore',
			order: 'desc'
		},
		title_asc: {
			field: 'title',
			order: 'asc'
		},
		title_desc: {
			field: 'title',
			order: 'desc'
		}
	}
};

export function load({ sortAggregationsBy = 'key' } = {}) {
	const processedCorpus = corpus.map((item) => {
		const technique = Array.isArray(item.layoutDesc?.layout?.rs)
			? item.layoutDesc.layout.rs[0]?.ana
			: item.layoutDesc?.layout?.rs?.ana;
		const pigment = Array.isArray(item.layoutDesc?.layout?.rs)
			? item.layoutDesc.layout.rs.find((rs) => rs.ana.includes('#execution.rubrication'))?.ana
			: item.layoutDesc?.layout?.rs?.ana === '#execution.rubrication'
				? '#execution.rubrication'
				: undefined;

		return {
			...item,
			notAfter: item.notAfter ?? undefined,
			notBefore: item.notBefore ?? undefined,
			language: item.textLang?._?.trim() ?? undefined,
			inscriptionType: item.type?._?.trim() ?? undefined,
			objectType: getHierarchicalValues(item.objectType?.ana),
			material: getHierarchicalValues(item.material?.ana),
			technique: getHierarchicalValues(technique),
			pigment: getHierarchicalValues(pigment),
			damage: getHierarchicalValues(item.layoutDesc?.layout?.damage?.ana ?? undefined, false),
			repository: item.repository?._?.trim() ?? undefined
		};
	});

	searchConfig.aggregations = Object.fromEntries(
		Object.entries(searchConfig.aggregations).map(([key, agg]) => [
			key,
			{ ...agg, sort: sortAggregationsBy }
		])
	);

	searchEngine = itemsjs(processedCorpus, searchConfig);
}

/**
 *
 * @param {string} value
 * @param {string | null} leaf
 * @returns {string[] | undefined}
 */
function getHierarchicalValues(value, discardRoot = true) {
	if (!value) return undefined;

	let parts = value
		.replaceAll('#', '')
		.split('.')
		.map((v) => v.trim())
		.map((v) => v.replaceAll('_', ' '));

	if (discardRoot) {
		parts = parts.slice(1);
	}

	if (parts.length === 1) {
		return [parts[0]];
	}

	const hierarchicalValues = [];

	for (let i = 1; i < parts.length + 1; i++) {
		hierarchicalValues.push(parts.slice(0, i).join(':::'));
	}

	return hierarchicalValues;
}

/**
 * @typedef {{
 *   limit?: number;
 *   query?: string;
 *   page?: number;
 *   sort?: string;
 *   filters?: Record<string, any>;
 *   dateRange?: [number | undefined, number | undefined];
 * }} SearchOptions
 *
 * @param {SearchOptions} options
 */
export function search({
	limit = 20,
	page = 1,
	query = '',
	sort = 'file_asc',
	filters = {},
	dateRange = [undefined, undefined]
}) {
	if (!searchEngine) load();
	return searchEngine.search({
		per_page: limit,
		page,
		query,
		sort,
		filters,
		filter: function (item) {
			if (!dateRange[0] && !dateRange[1]) return true;
			return (
				(!dateRange[0] || item.notBefore >= dateRange[0]) &&
				(!dateRange[1] || item.notAfter <= dateRange[1])
			);
		}
	});
}
