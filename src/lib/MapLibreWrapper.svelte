<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
	import { liveQuery } from 'dexie';
	import { db, type LocalGeoJSONRouteEntity } from '$lib/localDB';
	import RoutesViewer from '$lib/MapLibreLocalRoutes.svelte';
	
	let geoJSONRoutes = liveQuery<LocalGeoJSONRouteEntity>(() => db.geoJSONRoutes.toArray())

</script>

<MapLibre
	center={[50, 20]}
	zoom={7}
	class="map"
	standardControls
	style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
>
	{#if $geoJSONRoutes}
		<RoutesViewer geoJSONRoutes={$geoJSONRoutes} />
	{:else}
		<p>Loading...</p>
	{/if}
</MapLibre>

<style>
	:global(.map) {
		height: 500px;
	}
</style>
