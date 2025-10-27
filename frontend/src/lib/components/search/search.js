import { Index } from 'flexsearch';
import itemsjs from 'itemsjs';
import corpus from '../../../data/corpus.json';
import lemmas from '../../../data/lemmas.json';

/**
 * Manages the search functionality, combining faceted search with itemsjs
 * and full-text search with flexsearch.
 *
 * The `itemsEngine` is initialized by the `load()` function.
 *
 * @type {{itemsEngine: ReturnType<import('itemsjs')> | undefined, flexIndex: import('flexsearch').Index}}
 */
const searchEngine = {
	itemsEngine: undefined,
	flexIndex: new Index({
		tokenize: 'forward'
	})
};

/**
 * @typedef {Object} SearchConfig
 * @property {Object} aggregations
 * @property {string[]} searchableFields
 * @property {Object} sortings
 * @property {boolean} isExactSearch
 */

/** @type {SearchConfig} */
const searchConfig = {
	custom_id_field: 'file',
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
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		languageCert: {
			title: 'Language certainty',
			hide_zero_doc_count: true,
			size: 10,
			sort: 'key',
			chosen_filters_on_top: false
		},
		provenance: {
			title: 'Provenance',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		inscriptionType: {
			title: 'Inscription type',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		objectType: {
			title: 'Object type',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		material: {
			title: 'Material',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		technique: {
			title: 'Technique',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key',
			conjunction: false
		},
		pigment: {
			title: 'Pigment',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		lettering: {
			title: 'Lettering',
			hide_zero_doc_count: true,
			size: 500,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
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
		condition: {
			title: 'Object condition',
			hide_zero_doc_count: true,
			size: 100,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		damage: {
			title: 'Text condition',
			hide_zero_doc_count: true,
			size: 100,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		repository: {
			title: 'Repository',
			hide_zero_doc_count: true,
			size: 200,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		publications: {
			title: 'Publication',
			hide_zero_doc_count: true,
			size: 2000,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		status: {
			title: 'Status',
			hide_zero_doc_count: true,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		}
	},
	searchableFields: [],
	sortings: {
		file_asc: {
			field: 'file',
			order: 'asc',
			label: 'File'
		},
		file_desc: {
			field: 'file',
			order: 'desc',
			label: 'File'
		},
		notAfter_asc: {
			field: 'notAfter',
			order: 'asc',
			label: 'Not After'
		},
		notAfter_desc: {
			field: 'notAfter',
			order: 'desc',
			label: 'Not After'
		},
		notBefore_asc: {
			field: 'notBefore',
			order: 'asc',
			label: 'Not Before'
		},
		notBefore_desc: {
			field: 'notBefore',
			order: 'desc',
			label: 'Not Before'
		},
		title_asc: {
			field: 'title',
			order: 'asc',
			label: 'Title'
		},
		title_desc: {
			field: 'title',
			order: 'desc',
			label: 'Title'
		},
		language_asc: {
			field: 'language',
			order: 'asc',
			label: 'Language'
		},
		language_desc: {
			field: 'language',
			order: 'desc',
			label: 'Language'
		},
		objectType_asc: {
			field: 'objectType',
			order: 'asc',
			label: 'Object Type'
		},
		objectType_desc: {
			field: 'objectType',
			order: 'desc',
			label: 'Object Type'
		}
	},
	isExactSearch: false
};

searchConfig.searchableFields = [
	'file',
	'keywords',
	'title',
	'text',
	'lemmas',
	...Object.keys(searchConfig.aggregations)
];

export { searchConfig };

export function load({
	sortAggregationsBy = 'key',
	languageConjunction = true,
	publicationConjunction = true,
	isExactSearch = false
} = {}) {
	const processedCorpus = corpus
		.filter((item) => item?.status?._ !== 'deprecated')
		.map((item) => {
			const itemLemmas = lemmas.find((l) => l.file === item.file)?.lemmas ?? [];
			const itemText = lemmas.find((l) => l.file === item.file)?.text ?? [];

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

			let repositoryRole = item.repository?.role?.toLowerCase() ?? undefined;
			repositoryRole = repositoryRole?.indexOf('private') !== -1 ? 'private' : repositoryRole;

			const repository =
				repositoryRole?.indexOf('private') !== -1 ||
				item.repository?._?.toLowerCase().indexOf('private') !== -1
					? 'private'
					: (item.repository?._?.trim() ?? undefined);

			return {
				...item,
				lemmas: [...itemLemmas, ...itemLemmas.flatMap((l) => [`lemma_${l}`, `text_${l}`])],
				text: [...itemText, ...itemText.map((t) => `text_${t}`)],
				status: item?.status?._ ?? undefined,
				// raw values, because the original are converted to facet values
				rawObjectType: item.objectType,
				// facet values
				notAfter: item?.date?.notAfter ?? undefined,
				notBefore: item?.date?.notBefore ?? undefined,
				language: item?.textLang?.languages ?? undefined,
				languageCert: item?.textLang?.cert ?? undefined,
				inscriptionType: getHierarchicalValues(item.type?.ana),
				objectType: getHierarchicalValues(item.objectType?.ana),
				material: getHierarchicalValues(item.material?.ana),
				technique: getHierarchicalValues(technique),
				pigment: getHierarchicalValues(pigment),
				lettering: getLetteringOptions(item?.handNote?.lettering?.ref),
				letterHeightAtLeast: Math.min(...letterHeights.map((d) => d.atLeast)),
				letterHeightAtMost: Math.max(...letterHeights.map((d) => d.atMost)),
				condition: getHierarchicalValues(item.condition?.ana),
				damage: getHierarchicalValues(item.layoutDesc?.layout?.damage?.ana ?? undefined, false),
				repository:
					repositoryRole && repository !== repositoryRole
						? [repositoryRole, `${repositoryRole}:::${repository}`]
						: repository,
				publications: item.publications
			};
		});

	searchConfig.aggregations = Object.fromEntries(
		Object.entries(searchConfig.aggregations).map(([key, agg]) => [
			key,
			{ ...agg, sort: sortAggregationsBy }
		])
	);
	searchConfig.aggregations.language.conjunction = languageConjunction;
	searchConfig.aggregations.publications.conjunction = publicationConjunction;
	searchConfig.isExactSearch = isExactSearch;

	searchEngine.itemsEngine = itemsjs(processedCorpus, searchConfig);

	const aggregationKeys = Object.keys(searchConfig.aggregations);

	for (const item of processedCorpus) {
		const contentParts = [];

		contentParts.push(item.file);
		if (item.title) contentParts.push(...item.title);
		if (item.keywords) contentParts.push(...item.keywords);
		if (item.text) contentParts.push(...item.text);
		if (item.lemmas) contentParts.push(...item.lemmas);

		for (let i = 0; i < aggregationKeys.length; i++) {
			const value = item[aggregationKeys[i]];
			if (value !== undefined && value !== null) {
				if (Array.isArray(value)) {
					contentParts.push(...value);
				} else {
					contentParts.push(value);
				}
			}
		}

		searchEngine.flexIndex.add(item.file, contentParts.join(' !! '));
	}
}

function capitalizeFirstLetter(val) {
	return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

/**
 *
 * @param {object[]} metadataRefs
 * @returns {string[]}
 */
function getLetteringOptions(metadataRefs) {
	let ret = [];

	if (metadataRefs && Array.isArray(metadataRefs)) {
		// {
		// 	 "_": "Α type1.1.1",
		//   "target": "https://kingsdigital[...]/types/greek-Α-type1.1.html"
		// }
		// =>
		// "Greek Α type1.1.1"
		ret = metadataRefs
			// Filter out the refs embedded in the introduction paragraph.
			// Only keep the list of refs with a type format.
			.filter((ref) => ref._.match(/ type[\d.]+$/))
			.map((ref) => {
				// Extract the script from the url and display it in the option.
				// Otherwise user can't tell latin A from greek A.
				let script = ref.target.replace(/^.*\/types\/(\w+)-.*$/, '$1');
				return `${capitalizeFirstLetter(script)} ${ref._}`;
			});
	}

	return ret;
}

/**
 *
 * @param {string} value
 * @param {boolean} discardRoot
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
 *   searchMode?: 'all' | 'lemmas-text-only' | 'lemmas-text-only-exact';
 *   page?: number;
 *   sort?: string;
 *   filters?: Record<string, any>;
 *   dateRange?: [number | undefined, number | undefined];
 *   letterHeightRange?: [number | undefined, number | undefined];
 * }} SearchOptions
 *
 * @param {SearchOptions} options
 */
export function search({
	limit = 20,
	page = 1,
	query = '',
	searchMode = 'all',
	sort = 'file_asc',
	filters = {},
	dateRange = [undefined, undefined],
	letterHeightRange = [undefined, undefined]
}) {
	if (!searchEngine.itemsEngine) {
		load();
	}

	if (!searchEngine.itemsEngine) {
		throw new Error('Error loading itemsjs engine');
	}

	let transformedQuery = query;
	if (query.trim() && searchMode === 'lemmas-text-only-exact') {
		transformedQuery = `lemma_${query}`;
	} else if (query.trim() && searchMode === 'lemmas-text-only') {
		transformedQuery = `text_${query}`;
	}

	const textSearchResults = searchEngine.flexIndex.search(transformedQuery, {
		limit: 5000
	});

	const searchOptions = {
		per_page: limit,
		page,
		sort,
		filters,
		filter: (item) => {
			const matchesDateRange =
				(!dateRange[0] && !dateRange[1]) ||
				(item.notBefore >= dateRange[0] && item.notAfter <= dateRange[1]);

			const matchesLetterHeightRange =
				item.letterHeightAtLeast >= letterHeightRange[0] &&
				item.letterHeightAtMost <= letterHeightRange[1];

			return matchesDateRange && matchesLetterHeightRange;
		}
	};

	if (transformedQuery) {
		searchOptions.ids = textSearchResults;
	}

	return searchEngine.itemsEngine.search(searchOptions);

	// if (query.trim() && searchResults.data?.items) {
	// 	searchResults.data.items = searchResults.data.items.map((item) => ({
	// 		...item,
	// 		matchedFields: analyseMatchedFields(item, query, searchMode)
	// 	}));
	// }

	// return searchResults;
}

/**
 * Analyse which fields in a search result contain the query terms and returns both field names and values
 * @param {Object} item - The search result item
 * @param {string} query - The original search query
 * @param {string} searchMode - The search mode used
 * @returns {Object} Object with field names as keys and matching values as values
 */
function analyseMatchedFields(item, query, searchMode) {
	if (!query.trim()) return {};

	const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
	const matchedFields = {};

	const searchableFields = searchConfig.searchableFields;
	for (const fieldName of searchableFields) {
		if (fieldName === 'keywords') {
			continue;
		}

		const fieldValue = item[fieldName];

		if (!fieldValue) continue;

		let fieldContent = '';
		let originalValue = fieldValue;

		if (Array.isArray(fieldValue)) {
			fieldContent = fieldValue.join(' ').toLowerCase();
			originalValue = fieldValue;
		} else if (typeof fieldValue === 'string') {
			fieldContent = fieldValue.toLowerCase();
			originalValue = fieldValue;
		} else if (typeof fieldValue === 'number') {
			fieldContent = fieldValue.toString().toLowerCase();
			originalValue = fieldValue;
		}

		const hasMatch = queryTerms.some((term) => {
			if (searchMode === 'lemmas-text-only-exact') {
				return fieldContent.includes(term);
			}
			if (['text', 'lemmas', 'title', 'keywords'].includes(fieldName)) {
				return fieldContent.includes(term);
			}
			return fieldContent.includes(term);
		});

		if (hasMatch) {
			matchedFields[fieldName] = originalValue;
		}
	}

	return matchedFields;
}
