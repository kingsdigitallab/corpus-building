import { describe, test, expect } from 'vitest';
import { formatKey, getLeaves, getLeafKeys, HIERARCHY_SEPARATOR } from './utils';

describe('formatKey', () => {
    test('should replace hierarchy separators with label separator', () => {
        expect(formatKey('a:::b:::c')).toBe('a > b > c');
    });

    test('should return key unchanged when no separators', () => {
        expect(formatKey('simple')).toBe('simple');
    });

    test('should return empty string for undefined', () => {
        expect(formatKey(undefined)).toBe('');
    });
});

describe('getLeaves', () => {
    test('should return only leaf buckets (no children exist)', () => {
        const buckets = [
            { key: 'a', doc_count: 10 },
            { key: `a${HIERARCHY_SEPARATOR}b`, doc_count: 5 },
            { key: `a${HIERARCHY_SEPARATOR}b${HIERARCHY_SEPARATOR}c`, doc_count: 3 }
        ];
        const leaves = getLeaves(buckets);
        expect(leaves).toEqual([{ key: `a${HIERARCHY_SEPARATOR}b${HIERARCHY_SEPARATOR}c`, doc_count: 3 }]);
    });

    test('should return all buckets when none are parents', () => {
        const buckets = [
            { key: 'x', doc_count: 1 },
            { key: 'y', doc_count: 2 },
            { key: 'z', doc_count: 3 }
        ];
        expect(getLeaves(buckets)).toEqual(buckets);
    });

    test('should handle empty array', () => {
        expect(getLeaves([])).toEqual([]);
    });

    test('should handle multiple independent hierarchies', () => {
        const buckets = [
            { key: 'a', doc_count: 10 },
            { key: `a${HIERARCHY_SEPARATOR}b`, doc_count: 5 },
            { key: 'x', doc_count: 8 },
            { key: `x${HIERARCHY_SEPARATOR}y`, doc_count: 4 }
        ];
        const leaves = getLeaves(buckets);
        expect(leaves).toEqual([
            { key: `a${HIERARCHY_SEPARATOR}b`, doc_count: 5 },
            { key: `x${HIERARCHY_SEPARATOR}y`, doc_count: 4 }
        ]);
    });
});

describe('getLeafKeys', () => {
    test('should return only terminal keys', () => {
        const keys = ['a', `a${HIERARCHY_SEPARATOR}b`, `a${HIERARCHY_SEPARATOR}b${HIERARCHY_SEPARATOR}c`];
        const result = getLeafKeys(keys);
        expect(result).toEqual(new Set([`a${HIERARCHY_SEPARATOR}b${HIERARCHY_SEPARATOR}c`]));
    });

    test('should return all keys when none are parents', () => {
        const keys = ['x', 'y', 'z'];
        expect(getLeafKeys(keys)).toEqual(new Set(['x', 'y', 'z']));
    });

    test('should handle empty input', () => {
        expect(getLeafKeys([])).toEqual(new Set());
    });

    test('should handle single key', () => {
        expect(getLeafKeys(['only'])).toEqual(new Set(['only']));
    });
});
