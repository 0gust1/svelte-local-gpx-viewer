<script lang="ts">
	import * as Plot from '@observablehq/plot';

	type Props = {
		elevationValues: {
			coords: [number, number];
			distance: number;
			elevation: number;
			speed?: number;
			power?: number;
			heartRate?: number;
		}[];
		routePoint: {
			coords: [number, number];
			distance: number;
			elevation: number;
			speed?: number;
			power?: number;
			heartRate?: number;
		} | null;
	};

	let { elevationValues, routePoint = $bindable() }: Props = $props();

	let div: HTMLElement | undefined = $state();
	let w: number = $state(0);
	let h: number = $state(0);

	$effect(() => {
		const elevationDomain = [
			Math.min(...elevationValues.map((d) => d.elevation)),
			Math.max(...elevationValues.map((d) => d.elevation))
		];

		const heartRateDomain = [
			Math.min(...elevationValues.map((d) => d.heartRate)),
			Math.max(...elevationValues.map((d) => d.heartRate))
		];

		const speedDomain = [
			Math.min(...elevationValues.map((d) => d.speed)),
			Math.max(...elevationValues.map((d) => d.speed))
		];

		const normalizeHeartRate = (heartRate: number) =>
			((heartRate - heartRateDomain[0]) / (heartRateDomain[1] - heartRateDomain[0])) *
				(elevationDomain[1] - elevationDomain[0]) +
			elevationDomain[0];

		const normalizedSpeed = (speed: number) =>
			((speed - speedDomain[0]) / (speedDomain[1] - speedDomain[0])) *
				(elevationDomain[1] - elevationDomain[0]) +
			elevationDomain[0];

		const normalizedHeartRateValues = elevationValues.map((d) => ({
			...d,
			normalizedHeartRate: normalizeHeartRate(d.heartRate)
		}));

		const normalizedSpeedValues = elevationValues.map((d) => ({
			...d,
			normalizedSpeed: normalizedSpeed(d.speed)
		}));

		const plot = Plot.plot({
			marginLeft: 0,
			x: { label: 'Distance (km)' },
			y: { label: 'Elevation (m)', grid: true, nice: true, axis: 'right', domain: elevationDomain },
			marks: [
				Plot.lineY(elevationValues, { x: 'distance', y: 'elevation', stroke: '#00009933' }),
				Plot.areaY(elevationValues, {
					x: 'distance',
					y1: elevationDomain[0],
					y2: 'elevation',	
					fill: '#00009911'
				}),
				Plot.ruleX(
					elevationValues,
					Plot.pointerX({
						x: 'distance',
						y1: 0,
						y2: elevationDomain[1],
						stroke: '#00009988'
					})
				),
				Plot.dot(
					elevationValues,
					Plot.pointerX({
						x: 'distance',
						y: 'elevation',
						stroke: '#00009988'
					})
				),
				Plot.lineY(normalizedHeartRateValues, {
					x: 'distance',
					y: 'normalizedHeartRate',
					stroke: 'red'
				}),
				Plot.dot(
					normalizedHeartRateValues,
					Plot.pointerX({
						x: 'distance',
						y: 'normalizedHeartRate',
						stroke: 'red'
					})
				),
				Plot.lineY(normalizedSpeedValues, { x: 'distance', y: 'normalizedSpeed', stroke: 'green' }),
				Plot.dot(
					normalizedSpeedValues,
					Plot.pointerX({
						x: 'distance',
						y: 'normalizedSpeed',
						stroke: 'green'
					})
				)
			],
			width: w,
			height: h
		});

		div?.firstChild?.remove(); // Remove old chart, if any
		div?.append(plot);

		div?.addEventListener('input', (event) => {
			routePoint = plot.value;
		});
	});
</script>

<div class="flex h-2 gap-2">
	{#if routePoint}
		<span class="text-xs text-gray-500">
			→ {routePoint.distance.toFixed(2)} km
		</span>
		<span class="text-xs text-gray-500">
			↑ {routePoint.elevation.toFixed(2)} m
		</span>

		{#if routePoint.heartRate}
			<span class="text-xs text-gray-500">
				♥ {routePoint.heartRate} bpm
			</span>
		{/if}
		{#if routePoint.speed}
			<span class="text-xs text-gray-500">
				🚀 {((routePoint.speed * 60 * 60) / 1000).toFixed(2)} km/h
			</span>
		{/if}
	{/if}
	<span></span><span></span><span></span>
</div>
<div
	class="h-44 w-full"
	bind:this={div}
	role="img"
	bind:clientWidth={w}
	bind:clientHeight={h}
></div>
<!-- <div class="w-full" onmousemove={onMousemove} bind:this={div} role="img"></div> -->

<!-- <pre class='text-xs'>{JSON.stringify(elevationValues,null,2)}</pre> -->
