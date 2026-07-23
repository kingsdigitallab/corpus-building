import { describe, test, expect } from 'vitest';
import { formatInscriptionDate } from './format';

describe('formatInscriptionDate', () => {
    test('should return empty string for null or undefined input', () => {
        expect(formatInscriptionDate(null)).toBe('');
        expect(formatInscriptionDate(undefined)).toBe('');
    });

    test('should format both CE dates', () => {
        expect(formatInscriptionDate({ notBefore: 100, notAfter: 200 })).toBe('CE 100 - CE 200');
    });

    test('should format both BCE dates', () => {
        expect(formatInscriptionDate({ notBefore: -500, notAfter: -300 })).toBe(
            '500 BCE - 300 BCE'
        );
    });

    test('should format mixed BCE and CE dates', () => {
        expect(formatInscriptionDate({ notBefore: -100, notAfter: 50 })).toBe('100 BCE - CE 50');
    });

    test('should show Unknown for missing notBefore', () => {
        expect(formatInscriptionDate({ notAfter: 200 })).toBe('Unknown - CE 200');
    });

    test('should show Unknown for missing notAfter', () => {
        expect(formatInscriptionDate({ notBefore: 100 })).toBe('CE 100 - Unknown');
    });

    test('should show Unknown for both missing dates', () => {
        expect(formatInscriptionDate({})).toBe('Unknown - Unknown');
    });

    test('should handle zero values as falsy (Unknown)', () => {
        expect(formatInscriptionDate({ notBefore: 0, notAfter: 100 })).toBe('Unknown - CE 100');
    });
});
