import corpus from '$data/corpus.json';
import * as config from '$lib/config';
import itemsjs from 'itemsjs';

/**
 * @type {itemsjs.ItemsJs<{ keywords: any; title: any; text: any; }, string, "keywords" | "title" | "text">}
 */
let searchEngine;

const searchConfig = {
	aggregations: {
		notAfter: {
			title: 'Not after',
			hide_zero_doc_count: true,
			show_facet_stats: true,
			size: 1000
		},
		notBefore: {
			title: 'Not before',
			hide_zero_doc_count: true,
			show_facet_stats: true,
			size: 1000
		},
		placeName: {
			title: 'Place name',
			hide_zero_doc_count: true,
			size: 200
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

export function load() {
	const processedCorpus = corpus.map((item) => ({
		...item,
		notAfter: item.notAfter ?? undefined,
		notBefore: item.notBefore ?? undefined
	}));

	searchEngine = itemsjs(processedCorpus, searchConfig);
}

/**
 * @typedef {{
 *   limit?: number;
 *   query?: string;
 *   page?: number;
 *   sort?: string;
 *   filters?: Record<string, any>;
 * }} SearchOptions
 *
 * @param {SearchOptions} options
 */
export function search({
	limit = config.search.limit,
	page = 1,
	query = '',
	sort = 'file_asc',
	filters = {}
}) {
	if (!searchEngine) load();
	return searchEngine.search({ per_page: limit, page, query, sort, filters });
}
