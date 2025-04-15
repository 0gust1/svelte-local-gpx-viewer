<script lang="ts">
	import { base } from '$app/paths';
	import { defaultStyle } from '$lib/maplibreStyles';
	import type { StyleSpecification } from 'maplibre-gl';
	import { page } from '$app/state';
	import { getUIRoutesManager } from '$lib/routesData.svelte';
	import { MapLibre } from 'svelte-maplibre';
	import RoutesViewer from '$lib/MapLibreRoute.svelte';
	import RouteDataEdit from '$lib/RouteDataEdit.svelte';
	import type { RouteEntity } from '$lib';

	let { routeId, mapStyle = defaultStyle, pitch=0 }: { routeId: string; mapStyle: StyleSpecification, pitch: number } =
		$props();
	let uiRoutes = getUIRoutesManager();
	let routeState: RouteEntity | null = $state(null);

	let bounds = $derived.by(() => {
		if (routeState) {

			//if bounding box has 6 elements, it means it is a 3D bounding box, so we need to remove the last 2 elements
			let extendFactor = 0.1;
			let [minX, minY, maxX, maxY] =
			routeState.bbox.length === 6 ? routeState.bbox.slice(0, 4) : routeState.bbox;

			// Extend the bounding box by the given factor
			const width = maxX - minX;
			const height = maxY - minY;

			minX -= width * extendFactor;
			maxX += width * extendFactor;
			minY -= height * extendFactor;
			maxY += height * extendFactor;

			return [minX, minY, maxX, maxY] as [number, number, number, number];
		}
	});

	let routePromise = $derived.by(() => {
		return uiRoutes.getRoute(parseInt(routeId)).then((route) => {
			if (!route) {
				throw new Error(`Route ${routeId} not found`);
			}
			routeState = route;
			return route;
		});
	});
</script>

{#await routePromise}
	<h2 class="mb-4 text-2xl font-bold">Loading Route {page.params.id}...</h2>
{:then route}
	{#if routeState !== null}
		<div class="grid grid-cols-3 gap-4">
			<div class="">
				<RouteDataEdit route={routeState} />
			</div>
			<div class="col-span-2">
				<MapLibre
					center={[50, 20]}
					zoom={7}
					class="map"
					pitch={pitch}
					bounds={bounds}
					standardControls
					style={mapStyle}
					images={[
						{
							id: 'arrow_sm',
							url: './arrow_sm.png'
						}
					]}
				>
					<RoutesViewer {route} />
				</MapLibre>
			</div>
		</div>

		<details>
			<summary>Sensor data ({route.routeData.sensors.features.length})</summary>
			{#each route.routeData.sensors.features as sensor}
				<div class="m-2 border border-slate-300 p-2 text-xs">
					<p>coords: {sensor.geometry.coordinates}</p>
					<p>Properties:</p>
					<ul>
						{#each Object.entries(sensor.properties) as [key, value]}
							<li>{key}: {value}</li>
						{/each}
					</ul>
				</div>
			{:else}
				<p>No sensor data</p>
			{/each}
		</details>
	{/if}
{:catch error}
	<p>Error loading route: {error.message}</p>
{/await}
