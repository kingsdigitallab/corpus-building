import { describe, test, expect } from 'vitest';
import { formatInscriptionDate } from './format';

describe('formatInscriptionDate', () => {
    test('should return empty string for null or undefined input', () => {
        expect(formatInscriptionDate(null)).toBe('');
        expect(formatInscriptionDate(undefined)).toBe('');
    });

    test('should format both AD dates', () => {
        expect(formatInscriptionDate({ notBefore: 100, notAfter: 200 })).toBe('AD 100 - AD 200');
    });

    test('should format both BC dates', () => {
        expect(formatInscriptionDate({ notBefore: -500, notAfter: -300 })).toBe(
            '500 BC - 300 BC'
        );
    });

    test('should format mixed BC and AD dates', () => {
        expect(formatInscriptionDate({ notBefore: -100, notAfter: 50 })).toBe('100 BC - AD 50');
    });

    test('should show Unknown for missing notBefore', () => {
        expect(formatInscriptionDate({ notAfter: 200 })).toBe('Unknown - AD 200');
    });

    test('should show Unknown for missing notAfter', () => {
        expect(formatInscriptionDate({ notBefore: 100 })).toBe('AD 100 - Unknown');
    });

    test('should show Unknown for both missing dates', () => {
        expect(formatInscriptionDate({})).toBe('Unknown - Unknown');
    });

    test('should handle zero values as falsy (Unknown)', () => {
        expect(formatInscriptionDate({ notBefore: 0, notAfter: 100 })).toBe('Unknown - AD 100');
    });
});
