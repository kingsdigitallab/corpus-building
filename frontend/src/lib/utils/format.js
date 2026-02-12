/**
 * Formats an inscription date object into a human-readable string.
 *
 * @param {{ notBefore?: number; notAfter?: number } | null | undefined} date
 * @returns {string}
 */
export function formatInscriptionDate(date) {
    if (!date) return '';
    const parts = [];
    for (const value of [date.notBefore, date.notAfter]) {
        if (value) {
            parts.push(value < 0 ? `${Math.abs(value)} BC` : `AD ${value}`);
        } else {
            parts.push('Unknown');
        }
    }
    return parts.join(' - ');
}
