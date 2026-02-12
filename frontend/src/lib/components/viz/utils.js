export const HIERARCHY_SEPARATOR = ':::';
export const HIERARCHY_SEPARATOR_LABEL = '>';

/** @param {string | undefined} key */
export const formatKey = (key) =>
    key?.replaceAll(HIERARCHY_SEPARATOR, ` ${HIERARCHY_SEPARATOR_LABEL} `) ?? '';

/** @param {{ key: string, doc_count: number }[]} buckets */
export function getLeaves(buckets) {
    const keys = new Set(buckets.map((b) => b.key));
    return buckets.filter(
        (b) => ![...keys].some((k) => k !== b.key && k.startsWith(b.key + HIERARCHY_SEPARATOR))
    );
}

/**
 * Filter an iterable of keys to only leaves (keys that are not a prefix of another key).
 * @param {Iterable<string>} keys
 * @returns {Set<string>}
 */
export function getLeafKeys(keys) {
    const all = [...keys];
    return new Set(
        all.filter(
            (k) => !all.some((other) => other !== k && other.startsWith(k + HIERARCHY_SEPARATOR))
        )
    );
}
