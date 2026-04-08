import { describe, test, expect } from 'vitest';
import {
    getValuesAsArray,
    computeCategoryData,
    computeHistogramData,
    computeActiveColourByKeys
} from './data';
import { HIERARCHY_SEPARATOR } from './utils';

describe('getValuesAsArray', () => {
    test('should return array if value is already an array', () => {
        expect(getValuesAsArray({ field: ['a', 'b'] }, 'field')).toEqual(['a', 'b']);
    });

    test('should return array of one element if value is scalar', () => {
        expect(getValuesAsArray({ field: 'text' }, 'field')).toEqual(['text']);
        expect(getValuesAsArray({ field: 42 }, 'field')).toEqual([42]);
        expect(getValuesAsArray({ field: false }, 'field')).toEqual([false]);
    });

    test('should return empty array if value is undefined or null', () => {
        expect(getValuesAsArray({ field: null }, 'field')).toEqual([]);
        expect(getValuesAsArray({ field: undefined }, 'field')).toEqual([]);
        expect(getValuesAsArray({}, 'field')).toEqual([]);
    });
});

describe('computeCategoryData', () => {
    const defaultAggregations = {
        category: {
            buckets: [
                { key: 'A', doc_count: 10 },
                { key: 'B', doc_count: 5 },
                { key: 'C', doc_count: 2 }
            ]
        },
        split: {
            buckets: [
                { key: 'X', doc_count: 15 },
                { key: 'Y', doc_count: 2 }
            ]
        }
    };

    test('should fallback to aggregations when no inscriptions provided', () => {
        const result = computeCategoryData({
            inscriptions: [],
            aggregations: defaultAggregations,
            selectedCategory: 'category',
            selectedColourBy: '',
            maxCategories: 2,
            excludedCategories: ['C']
        });

        expect(result).toEqual([
            { key: 'A', value: 10 },
            { key: 'B', value: 5 }
        ]);
    });

    test('should count inscriptions correctly for simple categories', () => {
        const inscriptions = [
            { category: 'A' },
            { category: 'B' },
            { category: 'A' },
            { category: ['A', 'B'] }
        ];

        const result = computeCategoryData({
            inscriptions,
            aggregations: defaultAggregations,
            selectedCategory: 'category',
            selectedColourBy: '',
            maxCategories: 5,
            excludedCategories: []
        });

        expect(result).toEqual([
            { key: 'A', value: 3 },
            { key: 'B', value: 2 }
        ]);
    });

    test('should respect maxCategories and sorting order', () => {
        const inscriptions = [
            { category: 'C' }, { category: 'C' }, { category: 'C' }, // 3
            { category: 'A' }, { category: 'A' }, // 2
            { category: 'B' } // 1
        ];

        const result = computeCategoryData({
            inscriptions,
            aggregations: defaultAggregations,
            selectedCategory: 'category',
            selectedColourBy: '',
            maxCategories: 2,
            excludedCategories: []
        });

        // 'C' has 3, 'A' has 2. 'B' should be excluded.
        expect(result).toEqual([
            { key: 'C', value: 3 },
            { key: 'A', value: 2 }
        ]);
    });

    test('should handle hierarchical keys, aggregating only leaf nodes', () => {
        const inscriptions = [
            { category: 'Root' },
            { category: `Root${HIERARCHY_SEPARATOR}Child 1` },
            { category: `Root${HIERARCHY_SEPARATOR}Child 2` },
            { category: `Root${HIERARCHY_SEPARATOR}Child 2` }
        ];

        const result = computeCategoryData({
            inscriptions,
            aggregations: defaultAggregations, // aggregations not needed for inscription branch
            selectedCategory: 'category',
            selectedColourBy: '',
            maxCategories: 5,
            excludedCategories: []
        });

        // 'Root' is not a leaf, so it's excluded from formatted output.
        expect(result).toEqual([
            { key: 'Root > Child 2', value: 2 },
            { key: 'Root > Child 1', value: 1 }
        ]);
    });

    test('should calculate correct split counts via selectedColourBy', () => {
        const inscriptions = [
            { category: 'A', split: 'X' },
            { category: 'A', split: ['X', 'Y'] },
            { category: 'B', split: 'Y' }
        ];

        const result = computeCategoryData({
            inscriptions,
            aggregations: defaultAggregations,
            selectedCategory: 'category',
            selectedColourBy: 'split',
            maxCategories: 5,
            excludedCategories: []
        });

        expect(result).toEqual([
            { key: 'A', value: 3, X: 2, Y: 1 },
            { key: 'B', value: 1, Y: 1 }
        ]);
    });
});

describe('computeHistogramData', () => {
    const defaultAggregations = {
        split: {
            buckets: [
                { key: 'X', doc_count: 10 },
                { key: 'Y', doc_count: 5 }
            ]
        }
    };

    test('should correctly bin chronological ranges', () => {
        const inscriptions = [
            { notBefore: 10, notAfter: 20 },
            { notBefore: 15, notAfter: 15 },
            { notBefore: -10, notAfter: 5 }, // spans across 0
        ];

        const result = computeHistogramData({
            inscriptions,
            aggregations: defaultAggregations,
            binSize: 10,
            selectedColourBy: ''
        });

        // minDate is -10 (binStart -10), maxDate is 20 (binEnd 20)
        // -10 to 0: covers { -10 to 5 } -> 1
        // 0 to 10: covers { -10 to 5 } -> 1
        // 10 to 20: covers { 10 to 20 }, { 15 to 15 } -> 2

        expect(result).toEqual([
            { key: '10 BCE – 0 CE', value: 1 },
            { key: '0 CE – 10 CE', value: 1 },
            { key: '10 CE – 20 CE', value: 2 }
        ]);
    });

    test('should ignore inscriptions with invalid or missing date boundaries', () => {
        const inscriptions = [
            { notBefore: 10, notAfter: 20 },
            { notBefore: 30, notAfter: 20 }, // invalid: nb > na
            { notBefore: 50 }, // missing na
            { notAfter: 60 } // missing nb
        ];

        const result = computeHistogramData({
            inscriptions,
            aggregations: defaultAggregations,
            binSize: 10,
            selectedColourBy: ''
        });

        expect(result).toEqual([
            { key: '10 CE – 20 CE', value: 1 }
        ]);
    });

    test('should apply colourBy combinations inside overlapping bins', () => {
        const inscriptions = [
            { notBefore: 10, notAfter: 20, split: 'X' },
            { notBefore: 15, notAfter: 25, split: 'Y' },
            { notBefore: 10, notAfter: 25, split: ['X', 'Y'] }
        ];

        const result = computeHistogramData({
            inscriptions,
            aggregations: defaultAggregations,
            binSize: 10,
            selectedColourBy: 'split'
        });

        // 10 to 20: Item 1 (X:1), Item 2 (Y:1), Item 3 (X:1, Y:1). Total: 3 (X=2, Y=2)
        // 20 to 30: Item 1 (X:1), Item 2 (Y:1), Item 3 (X:1, Y:1). Total: 3 (X=2, Y=2)

        expect(result).toEqual([
            { key: '10 CE – 20 CE', value: 3, X: 2, Y: 2 },
            { key: '20 CE – 30 CE', value: 3, X: 2, Y: 2 }
        ]);
    });
});

describe('computeActiveColourByKeys', () => {
    test('should return empty array if no selectedColourBy or data', () => {
        expect(computeActiveColourByKeys({ data: [], aggregations: {}, selectedColourBy: '', excludedCategories: [] })).toEqual([]);
        expect(computeActiveColourByKeys({ data: [{ key: 'A', X: 1 }], aggregations: {}, selectedColourBy: '', excludedCategories: [] })).toEqual([]);
    });

    test('should return keys that appear in the data subset ordered by initial aggregation popularity', () => {
        const aggregations = {
            split: {
                buckets: [
                    { key: 'A', doc_count: 100 },
                    { key: 'B', doc_count: 50 },
                    { key: 'C', doc_count: 10 },
                    { key: 'D', doc_count: 1 }
                ]
            }
        };

        const data = [
            { key: 'bin 1', C: 2, D: 1 },
            { key: 'bin 2', D: 5, A: 1 }
        ];

        // Based on popularity: A (100), B (50), C (10), D (1)
        // But only A, C, D exist in the data itself. B is completely missing.
        const result = computeActiveColourByKeys({
            data,
            aggregations,
            selectedColourBy: 'split',
            excludedCategories: []
        });

        expect(result).toEqual(['A', 'C', 'D']);
    });
});
