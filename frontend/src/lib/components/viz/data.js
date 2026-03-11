import { getLeaves, getLeafKeys, formatKey } from './utils.js';

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
 * Computes histogram data for Line and Histogram charts
 * @param {{
 *   inscriptions: any[],
 *   aggregations: Record<string, any>,
 *   binSize: number,
 *   selectedColourBy: string
 * }} params
 * @returns {Array<any>}
 */
export function computeHistogramData({
    inscriptions,
    aggregations,
    binSize,
    selectedColourBy
}) {
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

        for (let start = binStart; start < binEnd; start += size) {
            const binEndDate = start + size;
            if (nb < binEndDate && na >= start) {
                const binObj = bins.get(start) || { value: 0 };
                binObj.value += 1;

                if (selectedColourBy) {
                    const groupValues = getValuesAsArray(item, selectedColourBy);
                    for (const gv of groupValues) {
                        const k = String(gv);
                        if (validColourByKeys.has(k)) {
                            binObj[k] = (binObj[k] || 0) + 1;
                        }
                    }
                }
                bins.set(start, binObj);
            }
        }
    }

    /** @param {number} year @returns {string} */
    const formatYear = (year) => (year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`);

    return [...bins.entries()]
        .filter(([_, countsObj]) => countsObj.value > 0)
        .sort((a, b) => a[0] - b[0])
        .map(([start, countsObj]) => ({
            key: `${formatYear(start)} – ${formatYear(start + size)}`,
            ...countsObj
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

    const selectedColourByKeys = [...buckets].sort((a, b) => b.doc_count - a.doc_count).map((b) => b.key);

    return selectedColourByKeys.filter((key) =>
        data.some((d) => {
            const item = /** @type {Record<string, unknown>} */ (d);
            return typeof item[key] === 'number' && /** @type {number} */ (item[key]) > 0;
        })
    );
}
