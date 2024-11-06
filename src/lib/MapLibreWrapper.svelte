<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';
	import RoutesViewer from '$lib/MapLibreRoutes.svelte';
	
	let geoJSONRoutes = liveQuery(() => db.geoJSONRoutes.toArray())

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
