<script lang='ts'>
  import ObjectDisplay from './ObjectDisplay.svelte';
  let {data, level=0} = $props(); // The object to display
</script>

<div class="object-display level-{level}">
  {#if typeof data === 'object' && data !== null}
    {#if Array.isArray(data)}
      <ul>
        {#each data as item, index}
          <li>
            <details>
              <summary>Item {index}</summary>
              <ObjectDisplay data={item} level={level + 1} />
            </details>
          </li>
        {/each}
      </ul>
    {:else}
      <ul>
        {#each Object.entries(data) as [key, value]}
          <li>
            <details>
              <summary>{key}</summary>
              <ObjectDisplay data={value} level={level + 1} />
            </details>
          </li>
        {/each}
      </ul>
    {/if}
  {:else}
    <span class="font-mono">{data}</span>
  {/if}
</div>

<style lang="postcss">
  @reference "../app.css";
  .object-display {
    @apply text-sm;
  }

  .object-display.level-0 {
    > ul {
      @apply pl-0 border-l-0;
    }
  }

  ul {
    @apply list-none pl-1 border-slate-300 border-l-2;
  }
  details {
    @apply  pl-1 ;
  }
  details summary {
    @apply cursor-pointer;
    &:hover {
      @apply text-blue-500;
    }
  }
</style>