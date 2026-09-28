import { describe, test, expect } from 'vitest';
import {
    getValuesAsArray,
    computeCategoryData,
    computeHistogramData,
    computeActiveColourByKeys
} from './data';
import { HIERARCHY_SEPARATOR } from './utils';
import { vizBinWeightType } from '$lib/config';

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

    test('should throw for an invalid bin weight type', () => {
        const args = {
            inscriptions: [{ notBefore: 200, notAfter: 400 }],
            aggregations: defaultAggregations,
            binSize: 50,
            selectedColourBy: ''
        };

        expect(() => computeHistogramData({ ...args, binWeightType: 'quarterly' })).toThrow(
            /Invalid binWeightType/
        );
    });

    test('should default to the configured vizBinWeightType', () => {
        const args = {
            inscriptions: [{ notBefore: 200, notAfter: 400 }],
            aggregations: defaultAggregations,
            binSize: 50,
            selectedColourBy: ''
        };

        expect(computeHistogramData(args)).toEqual(
            computeHistogramData({ ...args, binWeightType: vizBinWeightType })
        );
    });

    describe('full weight type (legacy behaviour)', () => {
        test('should count each inscription once in every bin overlapped', () => {
            const inscriptions = [
                { notBefore: 10, notAfter: 20 },
                { notBefore: 15, notAfter: 15 },
                { notBefore: -10, notAfter: 5 } // spans across 0
            ];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 10,
                binWeightType: 'full',
                selectedColourBy: ''
            });

            // -10 to 0: covers { -10 to 5 } -> 1
            // 0 to 10: covers { -10 to 5 } -> 1
            // 10 to 20: covers { 10 to 20 }, { 15 to 15 } -> 2

            expect(result).toEqual([
                { key: '10 BCE – 0 CE', value: 1 },
                { key: '0 CE – 10 CE', value: 1 },
                { key: '10 CE – 20 CE', value: 2 }
            ]);
        });

        test('should count an inscription in a bin its range only touches at the boundary', () => {
            const inscriptions = [
                { notBefore: 200, notAfter: 250 }, // range ends exactly on a bin boundary
                { notBefore: 251, notAfter: 260 }
            ];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 50,
                binWeightType: 'full',
                selectedColourBy: ''
            });

            // The 200-250 inscription also lands in the 250-300 bin (boundary-touch quirk),
            // so 2 inscriptions produce a total of 3 across bins

            expect(result).toEqual([
                { key: '200 CE – 250 CE', value: 1 },
                { key: '250 CE – 300 CE', value: 2 }
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
                binWeightType: 'full',
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

    describe('even weight type', () => {
        test('should split each inscription evenly across the bins overlapped', () => {
            const inscriptions = [{ notBefore: 200, notAfter: 400 }];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 50,
                binWeightType: 'even',
                selectedColourBy: ''
            });

            expect(result).toEqual([
                { key: '200 CE – 250 CE', value: 0.25 },
                { key: '250 CE – 300 CE', value: 0.25 },
                { key: '300 CE – 350 CE', value: 0.25 },
                { key: '350 CE – 400 CE', value: 0.25 }
            ]);
        });

        test('should weight all overlapped bins equally regardless of overlap length', () => {
            const inscriptions = [{ notBefore: 210, notAfter: 360 }];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 50,
                binWeightType: 'even',
                selectedColourBy: ''
            });

            expect(result).toEqual([
                { key: '200 CE – 250 CE', value: 0.25 },
                { key: '250 CE – 300 CE', value: 0.25 },
                { key: '300 CE – 350 CE', value: 0.25 },
                { key: '350 CE – 400 CE', value: 0.25 }
            ]);
        });

        test('should count exact-date inscriptions once', () => {
            const inscriptions = [{ notBefore: 15, notAfter: 15 }];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 10,
                binWeightType: 'even',
                selectedColourBy: ''
            });

            expect(result).toEqual([{ key: '10 CE – 20 CE', value: 1 }]);
        });
    });

    describe('proportional weight type', () => {
        test('should split each inscription proportionally across the bins overlapped', () => {
            // A 200-400 inscription gives 50 of its 200 years to each 50-year bin -> 0.25 each
            const inscriptions = [{ notBefore: 200, notAfter: 400 }];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 50,
                binWeightType: 'proportional',
                selectedColourBy: ''
            });

            expect(result).toEqual([
                { key: '200 CE – 250 CE', value: 0.25 },
                { key: '250 CE – 300 CE', value: 0.25 },
                { key: '300 CE – 350 CE', value: 0.25 },
                { key: '350 CE – 400 CE', value: 0.25 }
            ]);
        });

        test('should weight bins by the share of the date range they contain', () => {
            // 210-360 spans 150 years: 40 fall in 200-250, 50 in 250-300, 50 in 300-350, 10 in 350-400
            const inscriptions = [{ notBefore: 210, notAfter: 360 }];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 50,
                binWeightType: 'proportional',
                selectedColourBy: ''
            });

            expect(result).toEqual([
                { key: '200 CE – 250 CE', value: 0.27 },
                { key: '250 CE – 300 CE', value: 0.33 },
                { key: '300 CE – 350 CE', value: 0.33 },
                { key: '350 CE – 400 CE', value: 0.07 }
            ]);
        });

        test('should not count bins that only touch the date range at a boundary', () => {
            const inscriptions = [
                { notBefore: 200, notAfter: 250 }, // range ends exactly on a bin boundary
                { notBefore: 251, notAfter: 260 }
            ];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 50,
                binWeightType: 'proportional',
                selectedColourBy: ''
            });

            expect(result).toEqual([
                { key: '200 CE – 250 CE', value: 1 },
                { key: '250 CE – 300 CE', value: 1 }
            ]);
        });

        test('should count exact-date inscriptions once', () => {
            const inscriptions = [{ notBefore: 15, notAfter: 15 }];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 10,
                binWeightType: 'proportional',
                selectedColourBy: ''
            });

            expect(result).toEqual([{ key: '10 CE – 20 CE', value: 1 }]);
        });

        test('should preserve the total count across bins', () => {
            const inscriptions = [
                { notBefore: 10, notAfter: 20 },
                { notBefore: 15, notAfter: 15 },
                { notBefore: -10, notAfter: 5 } // spans across 0
            ];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 10,
                binWeightType: 'proportional',
                selectedColourBy: ''
            });

            // -10 to 0: 10 of the 15 years of { -10 to 5 } -> 0.67
            // 0 to 10: the remaining 5 years -> 0.33
            // 10 to 20: { 10 to 20 } and { 15 to 15 } in full -> 2

            expect(result).toEqual([
                { key: '10 BCE – 0 CE', value: 0.67 },
                { key: '0 CE – 10 CE', value: 0.33 },
                { key: '10 CE – 20 CE', value: 2 }
            ]);

            // The three inscriptions sum to 3 across all bins
            const total = result.reduce((sum, d) => sum + d.value, 0);
            expect(total).toBe(3);
        });

        test('should apply fractional colourBy weights', () => {
            const inscriptions = [
                { notBefore: 10, notAfter: 20, split: 'X' },
                { notBefore: 15, notAfter: 25, split: 'Y' },
                { notBefore: 10, notAfter: 25, split: ['X', 'Y'] }
            ];

            const result = computeHistogramData({
                inscriptions,
                aggregations: defaultAggregations,
                binSize: 10,
                binWeightType: 'proportional',
                selectedColourBy: 'split'
            });

            // 10 to 20: X: 1 (10-20 in full) + 0.67 (10 of 15 years of 10-25)
            //           Y: 0.5 (5 of 10 years of 15-25) + 0.67. Total: 2.17 (X=1.67, Y=1.17)
            // 20 to 30: X: 0.33. Y: 0.5 + 0.33. Total: 0.83 (X=0.33, Y=0.83)

            expect(result).toEqual([
                { key: '10 CE – 20 CE', value: 2.17, X: 1.67, Y: 1.17 },
                { key: '20 CE – 30 CE', value: 0.83, X: 0.33, Y: 0.83 }
            ]);
        });
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
