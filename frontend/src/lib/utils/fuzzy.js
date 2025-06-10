/**
 * Check if two strings match using fuzzy matching calculated with Levenshtein distance
 * @param {string | null | undefined} str1
 * @param {string | null | undefined} str2
 * @returns {boolean}
 */
export function fuzzyMatch(str1, str2) {
	if (!str1 || !str2) return false;

	const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());

	// Allow for 1 character difference for strings up to 4 characters,
	// 2 characters for strings up to 8 characters,
	// and 3 characters for longer strings
	const maxDistance = Math.min(3, Math.ceil(str1.length / 3));

	return distance <= maxDistance;
}

/**
 * Calculate Levenshtein distance between two strings, adapted from
 * https://gist.github.com/andrei-m/982927
 * @param {string} str1
 * @param {string} str2
 * @returns {number}
 */
export function levenshteinDistance(str1, str2) {
	const m = str1.length;
	const n = str2.length;

	if (m === 0) return n;
	if (n === 0) return m;

	const matrix = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

	for (let i = 0; i <= m; i++) matrix[i][0] = i;
	for (let j = 0; j <= n; j++) matrix[0][j] = j;

	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (str1[i - 1] === str2[j - 1]) {
				matrix[i][j] = matrix[i - 1][j - 1];
			} else {
				matrix[i][j] = Math.min(
					// substitution
					matrix[i - 1][j - 1] + 1,
					// deletion
					matrix[i - 1][j] + 1,
					// insertion
					matrix[i][j - 1] + 1
				);
			}
		}
	}

	return matrix[m][n];
}
