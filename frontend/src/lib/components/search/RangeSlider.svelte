<script>
    import { Slider } from 'bits-ui';

    let {
        title = 'Range slider',
        min = 0,
        max = 100,
        step = 1,
        startLabel = 'From',
        endLabel = 'To',
        selectedRange = $bindable([0, 0]),
        rangeChange
    } = $props();
</script>

<h3>{title}</h3>
<div class="slider">
    <Slider.Root
        class="slider-root"
        {min}
        {max}
        {step}
        bind:value={selectedRange}
        type="multiple"
        autoSort={true}
        onValueCommit={rangeChange}
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
        <span>{startLabel}</span>
        <input type="number" bind:value={selectedRange[0]} {min} {max} oninput={rangeChange} />
    </label>
    <label>
        <span>{endLabel}</span>
        <input type="number" bind:value={selectedRange[1]} {min} {max} oninput={rangeChange} />
    </label>
</div>

<style>
    .range-inputs {
        display: flex;
        gap: var(--size-2);
        justify-content: space-between;
        width: 100%;
    }

    .range-inputs label {
        display: flex;
        flex-direction: column;
        gap: var(--size-1);
    }

    .range-inputs label input {
        background: transparent;
        border: 1px solid var(--border-color);

    }
</style> 