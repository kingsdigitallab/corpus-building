import corpus from '../../../data/corpus.json';
import lemmas from '../../../data/lemmas.json';
import itemsjs from 'itemsjs';

/**
 * @type {itemsjs.ItemsJs<{ keywords: any; title: any; text: any; }, string, "keywords" | "title" | "text">}
 */
let searchEngine;

/**
 * @typedef {Object} SearchConfig
 * @property {Object} aggregations
 * @property {string[]} searchableFields
 * @property {Object} sortings
 * @property {boolean} isExactSearch
 */

/** @type {SearchConfig} */
const searchConfig = {
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
			title: 'Condition',
			hide_zero_doc_count: true,
			size: 100,
			sort: 'key',
			conjunction: false,
			chosen_filters_on_top: false
		},
		damage: {
			title: 'Damage',
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

export function load({ sortAggregationsBy = 'key', languageConjunction = true } = {}) {
	const processedCorpus = corpus
		.filter((item) => item?.status?._ !== 'deprecated')
		.map((item) => {
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
				lemmas: lemmas.find((l) => l.file === item.file)?.lemmas ?? [],
				text: lemmas.find((l) => l.file === item.file)?.text ?? [],
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

	searchEngine = itemsjs(processedCorpus, searchConfig);
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
		filter: (item) => {
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
