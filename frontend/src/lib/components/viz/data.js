import { vizBinWeightType } from '$lib/config';
import { getLeaves, getLeafKeys, formatKey } from './utils.js';

const BIN_WEIGHT_TYPES = ['full', 'even', 'proportional'];
const ROUNDING_FACTOR = 100;

/** Help text describing how inscriptions are weighted across date bins, per weight type */
export const binWeightHelpTexts = {
    full: 'Inscriptions with uncertain dates may appear in multiple bins.',
    even: 'Inscriptions with uncertain dates are split evenly across the bins they overlap, so counts may be fractional.',
    proportional:
        'Inscriptions with uncertain dates are distributed proportionally across the bins they overlap, so counts may be fractional.'
};

/** @param {Record<string, unknown>} item @param {string} field @returns {unknown[]} */
export const getValuesAsArray = (item, field) => {
    const value = item[field];
    if (Array.isArray(value)) return value;
    if (value !== undefined && value !== null) return [value];
    return [];
};

/**
 * Computes categorical data for Bar and Donut charts
 * @param {{
 *   inscriptions: any[],
 *   aggregations: Record<string, any>,
 *   selectedCategory: string,
 *   selectedColourBy: string,
 *   maxCategories: number,
 *   excludedCategories: string[]
 * }} params
 * @returns {Array<any>}
 */
export function computeCategoryData({
    inscriptions,
    aggregations,
    selectedCategory,
    selectedColourBy,
    maxCategories,
    excludedCategories
}) {
    if (!inscriptions?.length) {
        const buckets = getLeaves([
            ...(aggregations[selectedCategory]?.buckets.filter(
				/** @param {{ key: string }} bucket */(bucket) =>
                    !excludedCategories.includes(bucket.key)
            ) || [])
        ]);
        return buckets
            .sort((a, b) => b.doc_count - a.doc_count)
            .slice(0, maxCategories)
            .map((b) => ({
                key: formatKey(b.key),
                value: b.doc_count
            }));
    }

    /** @type {Map<string, { count: number, items: any[] }>} */
    const categoryMap = new Map();
    for (const item of inscriptions) {
        const values = getValuesAsArray(item, selectedCategory);
        for (const v of values) {
            const key = String(v);
            if (excludedCategories.includes(key)) continue;
            if (!categoryMap.has(key)) categoryMap.set(key, { count: 0, items: [] });
            const entry = /** @type {{ count: number, items: any[] }} */ (categoryMap.get(key));
            entry.count++;
            entry.items.push(item);
        }
    }

    const leafKeys = getLeafKeys(categoryMap.keys());

    const sortedKeys = [...categoryMap.entries()]
        .filter(([key]) => leafKeys.has(key))
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, maxCategories)
        .map(([key]) => key);

    if (!selectedColourBy) {
        return sortedKeys.map((key) => ({
            key: formatKey(key),
            value: categoryMap.get(key)?.count || 0
        }));
    }

    const colourByBuckets = aggregations[selectedColourBy]?.buckets || [];
    const validColourByKeys = new Set(
        colourByBuckets.map((/** @type {{ key: string }} */ b) => b.key)
    );

    return sortedKeys
        .map((categoryKey) => {
            const items = categoryMap.get(categoryKey)?.items || [];
            /** @type {Record<string, number>} */
            const counts = {};

            for (const item of items) {
                const groupValues = getValuesAsArray(item, selectedColourBy);
                for (const gv of groupValues) {
                    const key = String(gv);
                    if (validColourByKeys.has(key)) {
                        counts[key] = (counts[key] || 0) + 1;
                    }
                }
            }

            return {
                key: formatKey(categoryKey),
                value: Object.values(counts).reduce((sum, c) => sum + c, 0),
                ...counts
            };
        })
        .filter((d) => Object.keys(d).length > 2);
}

/**
 * Computes the weight an inscription contributes to each date bin
 * @param {{
 *   notBefore: number,
 *   notAfter: number,
 *   binStart: number,
 *   binEnd: number,
 *   binSize: number,
 *   binWeightType: string
 * }} params
 * @returns {Array<[number, number]>} [bin start year, weight] pairs, one per bin touched
 */
export function computeBinWeights({ notBefore, notAfter, binStart, binEnd, binSize, binWeightType }) {
    /** @type {Array<[number, number]>} */
    const ret = [];

    /** @type {Array<[number, number]>} [bin start year, overlap in years] pairs */
    const overlapping = [];

    if (binWeightType === 'full') {
        for (let start = binStart; start < binEnd; start += binSize) {
            if (notBefore < start + binSize && notAfter >= start) {
                ret.push([start, 1]);
            }
        }
    } else if (notBefore === notAfter) {
        // An exactly dated inscription counts once, in the single bin containing its date
        const start = Math.floor(notBefore / binSize) * binSize;
        if (start >= binStart && start < binEnd) {
            ret.push([start, 1]);
        }
    } else {
        for (let start = binStart; start < binEnd; start += binSize) {
            const overlap = Math.min(notAfter, start + binSize) - Math.max(notBefore, start);
            if (overlap > 0) {
                overlapping.push([start, overlap]);
            }
        }

        if (binWeightType === 'even') {
            const weight = 1 / overlapping.length;
            for (const [start] of overlapping) {
                ret.push([start, weight]);
            }
        } else {
            const span = notAfter - notBefore;
            for (const [start, overlap] of overlapping) {
                ret.push([start, overlap / span]);
            }
        }
    }

    return ret;
}

/**
 * Computes histogram data for Line and Histogram charts
 * @param {{
 *   inscriptions: any[],
 *   aggregations: Record<string, any>,
 *   binSize: number,
 *   selectedColourBy: string,
 *   binWeightType?: string
 * }} params
 * @returns {Array<any>}
 */
export function computeHistogramData({
    inscriptions,
    aggregations,
    binSize,
    selectedColourBy,
    binWeightType = vizBinWeightType
}) {
    if (!BIN_WEIGHT_TYPES.includes(binWeightType)) {
        throw new Error(
            `Invalid binWeightType: ${binWeightType}. Must be one of ${BIN_WEIGHT_TYPES.join(', ')}.`
        );
    }

    if (!inscriptions?.length) return [];

    const size = Number(binSize);

    let minDate = Infinity;
    let maxDate = -Infinity;
    for (const item of inscriptions) {
        const nb = /** @type {number | undefined} */ (item.notBefore);
        const na = /** @type {number | undefined} */ (item.notAfter);
        if (nb === undefined || na === undefined || nb > na) continue;
        if (nb < minDate) minDate = nb;
        if (na > maxDate) maxDate = na;
    }

    if (minDate === Infinity || maxDate === -Infinity) return [];

    const binStart = Math.floor(minDate / size) * size;
    const binEnd = Math.ceil(maxDate / size) * size;

    /** @type {Map<number, Record<string, any>>} */
    const bins = new Map();
    for (let start = binStart; start < binEnd; start += size) {
        bins.set(start, { value: 0 });
    }

    const colourByBuckets = selectedColourBy ? (aggregations[selectedColourBy]?.buckets || []) : [];
    const validColourByKeys = new Set(
        colourByBuckets.map((/** @type {{ key: string }} */ b) => b.key)
    );

    for (const item of inscriptions) {
        const nb = /** @type {number | undefined} */ (item.notBefore);
        const na = /** @type {number | undefined} */ (item.notAfter);
        if (nb === undefined || na === undefined || nb > na) continue;

        const weights = computeBinWeights({
            notBefore: nb,
            notAfter: na,
            binStart,
            binEnd,
            binSize: size,
            binWeightType: binWeightType
        });

        for (const [start, weight] of weights) {
            const binObj = bins.get(start) || { value: 0 };
            binObj.value += weight;

            if (selectedColourBy) {
                const groupValues = getValuesAsArray(item, selectedColourBy);
                for (const gv of groupValues) {
                    const k = String(gv);
                    if (validColourByKeys.has(k)) {
                        binObj[k] = (binObj[k] || 0) + weight;
                    }
                }
            }
            bins.set(start, binObj);
        }
    }

    /** @param {number} n @returns {number} */
    const round = (n) => Math.round(n * ROUNDING_FACTOR) / ROUNDING_FACTOR;

    /** @param {number} year @returns {string} */
    const formatYear = (year) => (year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`);

    return [...bins.entries()]
        .filter(([, countsObj]) => countsObj.value > 0)
        .sort((a, b) => a[0] - b[0])
        .map(([start, countsObj]) => ({
            key: `${formatYear(start)} – ${formatYear(start + size)}`,
            ...Object.fromEntries(
                Object.entries(countsObj).map(([k, v]) => [k, round(/** @type {number} */ (v))])
            )
        }));
}

/**
 * Computes the active colour-by keys associated with the current data selection
 * @param {{
 *   data: any[],
 *   aggregations: Record<string, any>,
 *   selectedColourBy: string,
 *   excludedCategories: string[]
 * }} params
 * @returns {string[]}
 */
export function computeActiveColourByKeys({
    data,
    aggregations,
    selectedColourBy,
    excludedCategories
}) {
    if (!selectedColourBy || !data?.length) return [];

    const buckets = getLeaves(
        aggregations[selectedColourBy]?.buckets.filter(
			/** @param {{ key: string }} bucket */(bucket) => !excludedCategories.includes(bucket.key)
        ) || []
    );

    const selectedColourByKeys = [...buckets].sort((a, b) => a.key.localeCompare(b.key)).map((b) => b.key);

    return selectedColourByKeys.filter((key) =>
        data.some((d) => {
            const item = /** @type {Record<string, unknown>} */ (d);
            return typeof item[key] === 'number' && /** @type {number} */ (item[key]) > 0;
        })
    );
}
