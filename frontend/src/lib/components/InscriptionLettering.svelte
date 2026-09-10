<script>
	// lettering is the (list of) <p> under handNote converted to json
	const { lettering, handnoteDesc } = $props();

	let letteringPara = Array.isArray(lettering) ? lettering : new Array(lettering);
	let letterTypeRefs = letteringPara.filter(p => (p?.source ?? '').includes("annotator"));
	// console.log(letterTypeRefs)
	if (letterTypeRefs.length) {
		letterTypeRefs = letterTypeRefs[0]?.ref;
	}

</script>

{#if handnoteDesc?.html}
	<p>{@html handnoteDesc?.html}</p>
{/if}

{#if letterTypeRefs.length}
	<details>
		<summary>Types</summary>
		<ul>
			{#each letterTypeRefs as letterTypeRef}
				<li><a href={letterTypeRef.target}>{letterTypeRef._}</a></li>
			{/each}
		</ul>
	</details>
{/if}
