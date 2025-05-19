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

	const metrics = [
		{ name: 'altitude', label: 'Elevation (m)', stroke: '#000099', normalize: false },
		{ name: 'heartRate', label: 'Heart Rate (bpm)', stroke: '#ff0000', normalize: true },
		{ name: 'speed', label: 'Speed (km/h)', stroke: '#008800', normalize: true },
		{ name: 'power', label: 'Power (W)', stroke: '#ff8800', normalize: true }
	];

	$effect(() => {
		if (!div) return;

		// Find the extent of the altitude, heartRate and speed data for normalization
		const altitudeExtent = extent(routeDataValues, (d) => d.altitude);
		const heartRateExtent = extent(routeDataValues, (d) => d.heartRate);
		const speedExtent = extent(routeDataValues, (d) => d.speed);
		const powerExtent = extent(routeDataValues, (d) => d.power);

		// Create normalization scales based on altitude extent
		const heartRateScale = scaleLinear().domain(heartRateExtent).range(altitudeExtent);
		const speedScale = scaleLinear().domain(speedExtent).range(altitudeExtent);
		const powerScale = scaleLinear().domain(powerExtent).range(altitudeExtent);

		// Normalize the data
		const normalizedRouteDataValues = routeDataValues.map((d) => {
			const normalizedAltitude = d.altitude; // Do not normalize altitude
			const normalizedHeartRate =
				heartRateScale && heartRateExtent ? heartRateScale(d.heartRate) : d.heartRate;
			const normalizedSpeed = speedScale && speedExtent ? speedScale(d.speed) : d.speed;
			const normalizedPower = powerScale && powerExtent ? powerScale(d.power) : d.power;

			return {
				...d,
				normalizedAltitude: normalizedAltitude,
				normalizedHeartRate: normalizedHeartRate,
				normalizedSpeed: normalizedSpeed,
				normalizedPower: normalizedPower
			};
		});

		// Restructure the data for faceting
		const facetedData = metrics
			.filter((metric) => {
				// Check if the metric has any valid data
				if (metric.name === 'altitude') {
					return altitudeExtent && altitudeExtent[0] !== undefined && altitudeExtent[1] !== undefined;
				} else if (metric.name === 'heartRate') {
					return heartRateExtent && heartRateExtent[0] !== undefined && heartRateExtent[1] !== undefined;
				} else if (metric.name === 'speed') {
					return speedExtent && speedExtent[0] !== undefined && speedExtent[1] !== undefined;
				} else if (metric.name === 'power') {
					return powerExtent && powerExtent[0] !== undefined && powerExtent[1] !== undefined;
				}
				return false;
			})
			.flatMap((metric) => {
				return normalizedRouteDataValues.map((d) => {
					let value;
					if (metric.name === 'altitude') {
						value = d.normalizedAltitude;
					} else if (metric.name === 'heartRate') {
						value = d.normalizedHeartRate;
					} else if (metric.name === 'speed') {
						value = d.normalizedSpeed;
					} else if (metric.name === 'power') {
						value = d.normalizedPower;
					} else {
						value = d[metric.name]; // Use original value if not normalized
					}

					return {
						...d,
						metric: metric.name,
						value: value
					};
				});
			});

		const filteredMetrics = metrics.filter((metric) => {
			// Check if the metric has any valid data
			if (metric.name === 'altitude') {
				return altitudeExtent && altitudeExtent[0] !== undefined && altitudeExtent[1] !== undefined;
			} else if (metric.name === 'heartRate') {
				return heartRateExtent && heartRateExtent[0] !== undefined && heartRateExtent[1] !== undefined;
			} else if (metric.name === 'speed') {
				return speedExtent && speedExtent[0] !== undefined && speedExtent[1] !== undefined;
			} else if (metric.name === 'power') {
				return powerExtent && powerExtent[0] !== undefined && powerExtent[1] !== undefined;
			}
			return false;
		});

		const plot = Plot.plot({
			facet: {
				data: filteredMetrics,
				y: 'name',
				marginRight: 20
			},
			marginLeft: 60,
			width: w,
			height: h,
			x: { label: 'Distance (km)' },
			y: {
				label: null,
				grid: true,
				nice: true,
				axis: 'right'
			},
			marks: [
				Plot.lineY(facetedData, {
					x: 'distance',
					y: 'value',
					fy: 'metric',
					stroke: (d) => {
						const metric = metrics.find((m) => m.name === d.metric);
						return metric ? `${metric.stroke}33` : 'gray';
					}
				}),
				Plot.ruleX(
					routeDataValues,
					Plot.pointerX({
						x: 'distance',
						stroke: 'pink'
					})
				),
				Plot.frame()
			]
		});

		// Clear the div
		while (div.firstChild) {
			div.firstChild.remove();
		}

		div?.append(plot);

		div?.addEventListener('input', (event) => {
			// Assuming plot.value gives the data point closest to the mouse
			routePoint = plot.value; // Just take the first plot's value for now
		});
	});
</script>

<div
	class="mb-4 flex h-72 w-full"
	bind:this={div}
	role="img"
	bind:clientWidth={w}
	bind:clientHeight={h}
></div>
