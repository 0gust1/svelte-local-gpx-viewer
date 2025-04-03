<script lang="ts">
	import type { PageData } from './$types';
    import { base } from '$app/paths';
	// get the id parameter from the URL
	import { page } from '$app/state';
	import { getUIRoutesManager } from '$lib/routesData.svelte';
	import { MapLibre } from 'svelte-maplibre';
	import RoutesViewer from '$lib/MapLibreRoute.svelte';

	let uiRoutes = getUIRoutesManager();

	let routePromise = uiRoutes.getRoute(parseInt(page.params.id)).then((route) => {
		if (!route) {
			throw new Error(`Route ${page.params.id} not found`);
		}
		return route;
	});
</script>
<a href="{base}/">&lsaquo; return to routes</a>
{#await routePromise}
	<h2 class="mb-4 text-2xl font-bold">Loading Route {page.params.id}...</h2>
{:then route}
	
	<div class="grid grid-cols-3 gap-4">
		<div class="">
            <h2 class="mb-4 text-2xl font-bold">{route.name}</h2>
            <div>Here some content ? (markdown ?)</div>
            <h3>Photos ({route.routeData.photos.features.length})</h3>
			<p>Add Photos</p>
            <h3>Notes ({route.routeData.notes.features.length})</h3>
			<p>Add Notes</p>
			
		</div>
        <div class="col-span-2">
			<MapLibre
				center={[50, 20]}
				zoom={7}
				class="map"
				bounds={route.bbox as [number, number, number, number]}
				standardControls
				style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
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
{:catch error}
	<p>Error loading route: {error.message}</p>
{/await}
