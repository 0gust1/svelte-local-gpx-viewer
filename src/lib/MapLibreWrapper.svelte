<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
	import { liveGeoJSONRoutes } from '$lib/localDB';
	import RoutesViewer from '$lib/MapLibreLocalRoutes.svelte';
</script>

<MapLibre
	center={[50, 20]}
	zoom={7}
	class="map"
	standardControls
	style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
	images={[
		{
			id: 'arrow_sm',
			url: './arrow_sm.png'
		}
	]}
>
	<RoutesViewer geoJSONRoutes={$liveGeoJSONRoutes || []} />
</MapLibre>

<style>
	:global(.map) {
		height: 500px;
	}
</style>
