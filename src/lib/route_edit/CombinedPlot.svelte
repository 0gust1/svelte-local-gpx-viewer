<script lang="ts">
	import * as Plot from '@observablehq/plot';
	import { extent, scaleLinear } from 'd3';
	import type { RouteInteractivePoint } from '$lib/db_data/routes.datatypes';

	type Props = {
		routeDataValues: RouteInteractivePoint[];
		routePoint: RouteInteractivePoint | null;
	};

	let { routeDataValues, routePoint = $bindable() }: Props = $props();

	let div: HTMLElement | undefined = $state();
	let w: number = $state(0);
	let h: number = $state(0);
	let dragEvent: PointerEvent | null = $state(null);

	let isBrushing = $state(false);
	let brushStart: number | null = $state(null);
	let brushEnd: number | null = $state(null);

	const onMouseDown = (event: MouseEvent) => {
		console.log('mousedown', event);
		isBrushing = true;
		brushStart = event.offsetX;
		brushEnd = null;
	};

	const onMouseMove = (event: MouseEvent) => {
		console.log('mousemove', event);
		if (isBrushing && brushStart !== null) {
			brushEnd = event.offsetX;
			// Optionally, update the UI to show the brush area
		}
	};

	const onMouseUp = (event: MouseEvent) => {
		console.log('mouseup', event);
		// Handle the brush end event
		if (isBrushing && brushStart !== null && brushEnd !== null) {
			isBrushing = false;

			// Convert brushStart and brushEnd to data coordinates
			const startDistance = (brushStart / w) * routeDataValues[routeDataValues.length - 1].distance;
			const endDistance = (brushEnd / w) * routeDataValues[routeDataValues.length - 1].distance;

			// Handle the brushed range (e.g., filter data or highlight the range)
			console.log('Brushed range:', startDistance, endDistance);
		}
		isBrushing = false;
		brushStart = null;
		brushEnd = null;
	};

	$effect(() => {
		const altitudeExtent = extent(routeDataValues, (d)=> d.altitude) as [number, number];
		const heartRateExtent = extent(routeDataValues, (d) => d.heartRate) as [number, number];
		const speedExtent = extent(routeDataValues, (d) => d.speed) as [number, number];
		const powerExtent = extent(routeDataValues, (d) => d.power) as [number, number];

		const normalizeHeartRate = scaleLinear().domain(heartRateExtent).range(altitudeExtent);
		const normalizedSpeed = scaleLinear().domain(speedExtent).range(altitudeExtent);
		const normalizedPower = scaleLinear().domain(powerExtent).range(altitudeExtent);
		
		const normalizedHeartRateValues = routeDataValues.map((d) => ({
			...d,
			normalizedHeartRate: normalizeHeartRate(d.heartRate)
		}));

		const normalizedSpeedValues = routeDataValues.map((d) => ({
			...d,
			normalizedSpeed: normalizedSpeed(d.speed)
		}));

		const normalizedPowerValues = routeDataValues.map((d) => ({
			...d,
			normalizedPowerVal: normalizedPower(d.power)
		}));

		const plot = Plot.plot({
			marginLeft: 0,
			x: { label: 'Distance (km)' },
			y: { label: 'Elevation (m)', grid: true, nice: true, axis: 'right', domain: altitudeExtent },
			marks: [
				Plot.lineY(routeDataValues, { x: 'distance', y: 'altitude', stroke: '#00009933' }),
				Plot.areaY(routeDataValues, {
					x: 'distance',
					y1: altitudeExtent[0],
					y2: 'altitude',
					fill: '#00009911'
				}),
				Plot.ruleX(
					routeDataValues,
					Plot.pointerX({
						x: 'distance',
						stroke: '#00009988'
					})
				),
				Plot.dot(
					routeDataValues,
					Plot.pointerX({
						x: 'distance',
						y: 'altitude',
						stroke: '#00009988'
					})
				),
				Plot.lineY(normalizedHeartRateValues, {
					x: 'distance',
					y: 'normalizedHeartRate',
					stroke: '#ff000066'
				}),
				Plot.dot(
					normalizedHeartRateValues,
					Plot.pointerX({
						x: 'distance',
						y: 'normalizedHeartRate',
						stroke: '#ff000088'
					})
				),
				Plot.lineY(normalizedSpeedValues, {
					x: 'distance',
					y: 'normalizedSpeed',
					stroke: '#00880066'
				}),
				Plot.dot(
					normalizedSpeedValues,
					Plot.pointerX({
						x: 'distance',
						y: 'normalizedSpeed',
						stroke: '#00880088'
					})
				),
				Plot.lineY(normalizedPowerValues, {
					x: 'distance',
					y: 'normalizedPowerVal',
					stroke: '#ff880066'
				}),
				Plot.dot(
					normalizedPowerValues,
					Plot.pointerX({
						x: 'distance',
						y: 'normalizedPowerVal',
						stroke: '#ff880099'
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

		// div?.addEventListener('pointerdown', onMouseDown);
		// div?.addEventListener('pointermove', onMouseMove);
		// div?.addEventListener('pointerup', onMouseUp);
		// div?.addEventListener('pointerleave', () => {
		// 	routePoint = null;
		// });
	});
</script>

<div
	class="mb-4 h-44 w-full"
	bind:this={div}
	role="img"
	bind:clientWidth={w}
	bind:clientHeight={h}
></div>
<!-- <div class="w-full" onmousemove={onMousemove} bind:this={div} role="img"></div> -->

<!-- <pre class='text-xs'>{JSON.stringify(routeDataValues,null,2)}</pre> -->
