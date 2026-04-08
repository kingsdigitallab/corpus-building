import { describe, test, expect } from 'vitest';
import {
    escapeCSV,
    getInscriptionPlace,
    getInscriptionType,
    getInscriptionObjectType,
    getInscriptionLanguage,
    getInscriptionSettlement
} from './download';

describe('escapeCSV', () => {
    test('should return empty string for falsy input', () => {
        expect(escapeCSV('')).toBe('');
        expect(escapeCSV(null)).toBe('');
        expect(escapeCSV(undefined)).toBe('');
    });

    test('should replace newlines with spaces', () => {
        expect(escapeCSV('line1\nline2')).toBe('line1 line2');
        expect(escapeCSV('a\nb\nc')).toBe('a b c');
    });

    test('should escape double quotes', () => {
        expect(escapeCSV('say "hello"')).toBe('say ""hello""');
    });

    test('should handle both newlines and quotes', () => {
        expect(escapeCSV('line1\n"quoted"')).toBe('line1 ""quoted""');
    });

    test('should return plain text unchanged', () => {
        expect(escapeCSV('simple text')).toBe('simple text');
    });
});

describe('getInscriptionPlace', () => {
    test('should return the place matching the type', () => {
        const inscription = {
            places: [
                { type: 'ancient', _: 'Syracuse' },
                { type: 'modern', _: 'Siracusa' }
            ]
        };
        expect(getInscriptionPlace(inscription, 'ancient')).toBe('Syracuse');
        expect(getInscriptionPlace(inscription, 'modern')).toBe('Siracusa');
    });

    test('should return empty string if type not found', () => {
        const inscription = {
            places: [{ type: 'ancient', _: 'Syracuse' }]
        };
        expect(getInscriptionPlace(inscription, 'modern')).toBe('');
    });

    test('should return empty string for null inscription', () => {
        expect(getInscriptionPlace(null, 'ancient')).toBe('');
        expect(getInscriptionPlace(undefined, 'ancient')).toBe('');
    });

    test('should return empty string for inscription with no places', () => {
        expect(getInscriptionPlace({}, 'ancient')).toBe('');
    });
});

describe('getInscriptionType', () => {
    test('should return trimmed type', () => {
        expect(getInscriptionType({ type: { _: '  funerary  ' } })).toBe('funerary');
    });

    test('should return N/A for missing type', () => {
        expect(getInscriptionType({})).toBe('N/A');
        expect(getInscriptionType({ type: {} })).toBe('N/A');
    });
});

describe('getInscriptionObjectType', () => {
    test('should return the raw object type', () => {
        expect(getInscriptionObjectType({ rawObjectType: { _: 'stele' } })).toBe('stele');
    });

    test('should return N/A for missing object type', () => {
        expect(getInscriptionObjectType({})).toBe('N/A');
        expect(getInscriptionObjectType({ rawObjectType: {} })).toBe('N/A');
    });
});

describe('getInscriptionLanguage', () => {
    test('should return the language', () => {
        expect(getInscriptionLanguage({ textLang: { _: 'Greek' } })).toBe('Greek');
    });

    test('should return N/A for missing language', () => {
        expect(getInscriptionLanguage({})).toBe('N/A');
        expect(getInscriptionLanguage({ textLang: {} })).toBe('N/A');
    });
});

describe('getInscriptionSettlement', () => {
    test('should return the settlement', () => {
        expect(getInscriptionSettlement({ settlement: 'Catania' })).toBe('Catania');
    });

    test('should return N/A for missing settlement', () => {
        expect(getInscriptionSettlement({})).toBe('N/A');
    });

    test('should return N/A for falsy settlement', () => {
        expect(getInscriptionSettlement({ settlement: '' })).toBe('N/A');
    });
});
