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
			hide_zero_doc_count: false,
			size: 200,
			sort: 'key'
		},
		languageCert: {
			title: 'Language certainty',
			hide_zero_doc_count: false,
			size: 10,
			sort: 'key'
		},
		provenance: {
			title: 'Provenance',
			hide_zero_doc_count: false,
			size: 200,
			sort: 'key'
		},
		inscriptionType: {
			title: 'Inscription type',
			hide_zero_doc_count: false,
			size: 200,
			sort: 'key'
		},
		objectType: {
			title: 'Object type',
			hide_zero_doc_count: false,
			size: 200,
			sort: 'key'
		},
		material: {
			title: 'Material',
			hide_zero_doc_count: false,
			size: 200,
			sort: 'key'
		},
		technique: {
			title: 'Technique',
			hide_zero_doc_count: false,
			size: 200,
			sort: 'key'
		},
		pigment: {
			title: 'Pigment',
			hide_zero_doc_count: false,
			size: 200,
			sort: 'key'
		},
		letterHeightAtLeast: {
			title: 'Letter height at least',
			hide_zero_doc_count: true,
			show_facet_stats: true,
			size: 1000,
			sort: 'key'
		},
		letterHeightAtMost: {
			title: 'Letter height at most',
			hide_zero_doc_count: true,
			show_facet_stats: true,
			size: 1000,
			sort: 'key'
		},
		damage: {
			title: 'Damage',
			hide_zero_doc_count: false,
			size: 100,
			sort: 'key'
		},
		repository: {
			title: 'Repository',
			hide_zero_doc_count: false,
			size: 200,
			sort: 'key'
		},
		publicationAuthors: {
			title: 'Publication author',
			hide_zero_doc_count: false,
			size: 1000,
			sort: 'key'
		},
		publicationTitles: {
			title: 'Publication title',
			hide_zero_doc_count: false,
			size: 1500,
			sort: 'key'
		},
		publicationYears: {
			title: 'Publication year',
			hide_zero_doc_count: false,
			size: 1000,
			sort: 'key'
		},
		status: {
			title: 'Status',
			hide_zero_doc_count: false,
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
			? item.layoutDesc.layout.rs.find((rs) => rs?.ana?.includes('#execution.rubrication'))?.ana
			: item.layoutDesc?.layout?.rs?.ana === '#execution.rubrication'
				? '#execution.rubrication'
				: undefined;
		const letterHeights =
			item.letterHeights && item.letterHeights.length > 0
				? item.letterHeights.map((d) => ({ atLeast: d.atLeast ?? 0, atMost: d.atMost ?? 100 }))
				: [{ atLeast: 0, atMost: 100 }];
		const repository =
			item.repository?.role?.toLowerCase().indexOf('private') !== -1 ||
			item.repository?._?.toLowerCase().indexOf('private') !== -1
				? 'Private'
				: (item.repository?._?.trim() ?? undefined);

		return {
			...item,
			// raw values, because the original are converted to facet values
			rawObjectType: item.objectType,
			// facet values
			notAfter: item.date.notAfter ?? undefined,
			notBefore: item.date.notBefore ?? undefined,
			language: item.textLang?.languages ?? undefined,
			languageCert: item.textLang?.cert ?? undefined,
			inscriptionType: getHierarchicalValues(item.type?.ana),
			objectType: getHierarchicalValues(item.objectType?.ana),
			material: getHierarchicalValues(item.material?.ana),
			technique: getHierarchicalValues(technique),
			pigment: getHierarchicalValues(pigment),
			letterHeightAtLeast: Math.min(...letterHeights.map((d) => d.atLeast)),
			letterHeightAtMost: Math.max(...letterHeights.map((d) => d.atMost)),
			damage: getHierarchicalValues(item.layoutDesc?.layout?.damage?.ana ?? undefined, false),
			repository,
			publicationAuthors: item.publicationAuthors,
			publicationTitles: item.publicationTitles,
			publicationYears: item.publicationYears
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

	if (parts.every((part) => part === '')) {
		return ['No data'];
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
	dateRange = [undefined, undefined],
	letterHeightRange = [undefined, undefined]
}) {
	if (!searchEngine) load();
	return searchEngine.search({
		per_page: limit,
		page,
		query,
		sort,
		filters,
		filter: function (item) {
			const matchesDateRange =
				(!dateRange[0] && !dateRange[1]) ||
				(item.notBefore >= dateRange[0] && item.notAfter <= dateRange[1]);

			const matchesLetterHeightRange =
				item.letterHeightAtLeast >= letterHeightRange[0] &&
				item.letterHeightAtMost <= letterHeightRange[1];

			return matchesDateRange && matchesLetterHeightRange;
		}
	});
}
