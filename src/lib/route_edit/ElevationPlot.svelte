<script lang="ts">
	import * as Plot from '@observablehq/plot';
	
  type Props = {
		elevationValues: { coords: [number, number]; distance: number; elevation: number }[]
    routePoint: { coords: [number, number]; distance: number; elevation: number }|null
	};

	let { elevationValues, routePoint = $bindable() }: Props = $props();

	let div: HTMLElement | undefined = $state();
	let w: number = $state(0);
	let h: number = $state(0);

	$effect(() => {
		div?.firstChild?.remove(); // remove old chart, if any
		//div?.append(Plot.lineY(elevationValues).plot({ grid: true })); // add the new chart
		const plot = Plot.plot({
			x: { label: 'Distance (km)' },
			y: { label: 'Elevation (m)', grid: true, nice: true, axis: 'right' },
			marks: [
				// Plot.ruleY([0]),
				Plot.lineY(elevationValues, { x: 'distance', y: 'elevation', tip: 'x' }),
				Plot.ruleX(
					elevationValues,
					Plot.pointerX({ x: 'distance', py: 'elevation', stroke: 'red' })
				),
				Plot.dot(elevationValues, Plot.pointerX({ x: 'distance', y: 'elevation', stroke: 'red' })),
				Plot.text(
					elevationValues,
					Plot.pointerX({
						px: 'distance',
						py: 'elevation',
						dy: -17,
						frameAnchor: 'top-left',
						fontVariant: 'tabular-nums',
						text: (d) =>
							[`Distance ${d.distance.toFixed(2)}`, `Elevation ${d.elevation.toFixed(2)}`].join(
								'   '
							)
					})
				)
			],
			width: w,
			height: h
		});
		div?.append(plot);

		div?.addEventListener('input', (event) => {
			routePoint = plot.value;
      console.log(plot.value);
		});
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
