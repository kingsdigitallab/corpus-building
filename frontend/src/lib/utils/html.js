/**
 * HTML utility functions for text extraction and manipulation.
 */

/**
 * Strips HTML tags from a string and normalizes whitespace.
 * Preserves line structure by converting <br> tags to newlines.
 *
 * @param {string} html - The HTML string to strip.
 * @returns {string} The plain text content.
 */
export function stripHtml(html) {
    if (!html) return '';

    return (
        html
            // Replace <br> tags with newlines
            .replace(/<br\s*\/?>/gi, '\n')
            // Remove line numbers (they're in separate spans)
            .replace(/<span class="linenumber">\d+<\/span>/g, '')
            // Remove all remaining HTML tags
            .replace(/<[^>]+>/g, '')
            // Decode common HTML entities
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            // Normalize whitespace within lines (but preserve newlines)
            .split('\n')
            .map((line) => line.replace(/\s+/g, ' ').trim())
            .join('\n')
            // Remove empty lines
            .replace(/\n+/g, '\n')
            .trim()
    );
}
