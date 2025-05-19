<script lang="ts">
	import CombinedPlot from './CombinedPlot.svelte';
	import FacetedPlot from './FacetedPlot.svelte';
	import { point } from '@turf/helpers';
	import distance from '@turf/distance';

	import type { RouteInteractivePoint, RouteEntity } from '$lib/db_data/routes.datatypes';

	type Props = {
		route: RouteEntity;
		routePoint: RouteInteractivePoint | null;
	};

	let { route, routePoint = $bindable() }: Props = $props();

	let isDefaultCombinedPlot = $derived.by(() => {
		// if no sensor data, we only have to show the elevation plot, so we set the default plot to be the combined plot
		if (route.routeData.sensors.features.length === 0) {
			return true;
		}

		// get a point in the middle of the route
		const midIndex = Math.floor(route.routeData.sensors.features.length / 2);
		const midPoint = route.routeData.sensors.features[midIndex];
		// if midpoint has more than 3 metrics among power, heartRate, cadence, speed
		// AND if route length is more than 50km
		// then we set the default plot to be the faceted plot
		const metricsCount = [
			midPoint.properties.power,
			midPoint.properties.heartRate,
			midPoint.properties.cadence,
			midPoint.properties.enhancedSpeed ?? midPoint.properties.speed
		].filter((metric) => metric && metric !== null && metric !== undefined).length;

		const routeLength = route.routeData.sensors.properties.totalDistance / 1000; // convert to km

		if (metricsCount > 2 || routeLength > 50) {
			return false;
		}
		return true;
	});

	let hasDetailedDataPoints = $derived.by(() => {
		// if there are sensor datas (i.e. data coming from a fit file), we can get directly the distance
		return route.routeData.sensors.features.length > 0;
	});

	let selectedPlot: 'combined' | 'faceted' = $derived(isDefaultCombinedPlot ? 'combined' : 'faceted');

	let routeDataValues: RouteInteractivePoint[] = $derived.by(() => {
		if (route) {
			// if there are sensor datas (i.e. data coming from a fit file), we can get directly the distance
			// if not, we have to calculate it
			if (route.routeData.sensors.features.length > 0) {
				return route.routeData.sensors.features.map((sensorPoint) => {
					const coords = sensorPoint.geometry.coordinates;
					return {
						coords: [coords[0], coords[1]],
						distance: sensorPoint.properties.distance / 1000, // convert to km
						altitude: sensorPoint.properties.altitude,
						power: sensorPoint.properties.power,
						heartRate: sensorPoint.properties.heartRate,
						cadence: sensorPoint.properties.cadence,
						temperature: sensorPoint.properties.temperature,
						speed: sensorPoint.properties.enhancedSpeed ?? sensorPoint.properties.speed,
						timestamp: sensorPoint.properties.timestamp
					};
				});
			} else {
				let cumulativeDistance = 0;
				return route.routeData.route.features
					.filter((f) => f.geometry.type == 'LineString')
					.flatMap((feature) => {
						const coords = feature.geometry.coordinates;
						return coords.map((c, i) => {
							if (i > 0) {
								const from = point(coords[i - 1]);
								const to = point(c);
								cumulativeDistance += distance(from, to, { units: 'kilometers' });
							}
							return {
								coords: [c[0], c[1]],
								distance: cumulativeDistance,
								altitude: c[2]
							};
						});
					});
			}
		}
		return [];
	});
</script>

<div class="flex h-2 gap-2">
	<div class="text-xs flex gap-2">
		<label>
			<input
				type="radio"
				class="w-3 h-3"
				name="plot-selection"
				bind:group={selectedPlot}
				value="combined"
			/>&nbsp;Combined</label
		>
		<label>
			<input
				type="radio"
				class="w-3 h-3"
				name="plot-selection"
				bind:group={selectedPlot}
				value="faceted"
			/>&nbsp;Faceted</label
		>
	</div>

	{#if routePoint}
		<span class="text-xs text-gray-500">
			→ {routePoint.distance.toFixed(2)} km
		</span>
		<span class="text-xs text-gray-500">
			↑ {routePoint.altitude.toFixed(2)} m
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
		{#if routePoint.power}
			<span class="text-xs text-gray-500">
				⚡️ {routePoint.power} W
			</span>
		{/if}
	{/if}
</div>

{#if selectedPlot === 'combined'}
	<CombinedPlot {routeDataValues} bind:routePoint />
{:else}
	<FacetedPlot {routeDataValues} bind:routePoint />
{/if}
