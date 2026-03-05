import { describe, test, expect } from 'vitest';
import { stripHtml } from './html';

describe('stripHtml', () => {
    test('should return empty string for null, undefined, or empty input', () => {
        expect(stripHtml(null)).toBe('');
        expect(stripHtml(undefined)).toBe('');
        expect(stripHtml('')).toBe('');
    });

    test('should strip HTML tags and return plain text', () => {
        expect(stripHtml('<p>Hello world</p>')).toBe('Hello world');
        expect(stripHtml('<div><span>Nested</span> text</div>')).toBe('Nested text');
    });

    test('should replace <br> tags with newlines', () => {
        expect(stripHtml('Line 1<br>Line 2')).toBe('Line 1\nLine 2');
        expect(stripHtml('Line 1<br/>Line 2')).toBe('Line 1\nLine 2');
        expect(stripHtml('Line 1<br />Line 2')).toBe('Line 1\nLine 2');
    });

    test('should remove line number spans', () => {
        expect(stripHtml('<span class="linenumber">1</span>Text')).toBe('Text');
        expect(stripHtml('<span class="linenumber">42</span>More text')).toBe('More text');
    });

    test('should decode common HTML entities', () => {
        expect(stripHtml('&amp;')).toBe('&');
        expect(stripHtml('&lt;')).toBe('<');
        expect(stripHtml('&gt;')).toBe('>');
        expect(stripHtml('&quot;')).toBe('"');
        expect(stripHtml('&#39;')).toBe("'");
        expect(stripHtml('&nbsp;')).toBe('');
    });

    test('should normalize whitespace within lines', () => {
        expect(stripHtml('<p>  too   many   spaces  </p>')).toBe('too many spaces');
    });

    test('should remove empty lines', () => {
        expect(stripHtml('Line 1<br><br>Line 2')).toBe('Line 1\nLine 2');
    });

    test('should handle complex HTML with multiple features', () => {
        const html =
            '<span class="linenumber">1</span><span>Hello</span><br><span class="linenumber">2</span><span>World &amp; more</span>';
        expect(stripHtml(html)).toBe('Hello\nWorld & more');
    });
});
