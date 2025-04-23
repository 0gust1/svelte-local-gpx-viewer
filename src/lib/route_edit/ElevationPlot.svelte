<script lang="ts">
	import * as Plot from '@observablehq/plot';

	let { elevationValues }: { elevationValues: number[] } = $props();

	let div: HTMLElement | undefined = $state();
	let w: number = $state(0);
	let h: number = $state(0);

	$effect(() => {
		div?.firstChild?.remove(); // remove old chart, if any
		//div?.append(Plot.lineY(elevationValues).plot({ grid: true })); // add the new chart
		div?.append(
			Plot.line(elevationValues).plot({
				grid: true,
				x: { label: 'Distance (km)' },
				y: { label: 'Elevation (m)' },
				width: w,
				height: h
			})
		);
	});
</script>

<div
	class="h-32 w-full"
	bind:this={div}
	role="img"
	bind:clientWidth={w}
	bind:clientHeight={h}
></div>
<!-- <div class="w-full" onmousemove={onMousemove} bind:this={div} role="img"></div> -->

<!-- <pre class='text-xs'>{JSON.stringify(elevationValues,null,2)}</pre> -->
