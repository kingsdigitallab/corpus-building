<script>
    import { Slider } from 'bits-ui';

    let {
        title = 'Range slider',
        min = 0,
        max = 100,
        step = 1,
        startLabel = 'From',
        endLabel = 'To',
        selectedRange = $bindable([0, 0])
    } = $props();

    function handleValueCommit(value) {
        selectedRange = [...value];
    }
</script>

<h3>{title}</h3>
<div class="slider">
    <Slider.Root
        class="slider-root"
        {min}
        {max}
        {step}
        value={selectedRange}
        type="multiple"
        autoSort={true}
        onValueCommit={handleValueCommit}
    >
    {#snippet children({ thumbs })}
        <span class="slider-track">
            <Slider.Range class="slider-range" />
        </span>
        {#each thumbs as index}
            <Slider.Thumb
                {index}
                class="slider-thumb"
                aria-label={`${index === 0 ? startLabel : endLabel}`}
            />
        {/each}
    {/snippet}
    </Slider.Root>
</div>
<div class="range-inputs">
    <label>
        {startLabel}
        <input type="number" bind:value={selectedRange[0]} {min} {max} />
    </label>
    <span>–</span>
    <label>
        <input type="number" bind:value={selectedRange[1]} {min} {max} />
        {endLabel}
    </label>
</div>

<style>
    .range-inputs {
        display: flex;
        gap: var(--size-2);
        justify-content: space-between;
        width: 100%;
    }
</style> 