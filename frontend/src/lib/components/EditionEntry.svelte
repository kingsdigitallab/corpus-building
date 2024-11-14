<script>
	import { digitalEditionUrls } from '$lib/config';

	/**
	 * @typedef {Object} EditionType
	 * @property {'TM' | 'EDR' | 'EDH' | 'EDCS' | 'PHI' | 'URI' | 'DOI'} type
	 * @property {string} _
	 * @property {string} [when]
	 */

	/** @type {{ edition: EditionType }} */
	let { edition } = $props();

	/**
	 * @param {string} value
	 */
	function padToSixDigits(value) {
		return value.padStart(6, '0');
	}

	/**
	 * @param {EditionType['type']} type
	 * @param {string} value
	 */
	function getEditionUrl(type, value) {
		if (!value) return '';

		switch (type) {
			case 'DOI':
				return digitalEditionUrls.DOI + value;
			case 'EDR':
			case 'EDH':
				return digitalEditionUrls[type] + padToSixDigits(value);
			case 'URI':
				return value;
			default:
				return digitalEditionUrls[type] + value;
		}
	}

	const url = $derived(getEditionUrl(edition.type, edition._));
	const displayText = $derived(
		edition.type === 'DOI' ? `DOI: ${edition._} (${edition.when})` : `${edition.type}: ${edition._}`
	);
</script>

{#if edition._}
	<a href={url} target="_blank" rel="noopener noreferrer">{displayText}</a>
{:else}
	{edition.type}: -
{/if}
