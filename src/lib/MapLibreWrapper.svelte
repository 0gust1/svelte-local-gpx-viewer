<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
	import type { StyleSpecification } from 'maplibre-gl';
	import { liveGeoJSONRoutes } from '$lib/localDB';
	import RoutesViewer from '$lib/MapLibreLocalRoutes.svelte';

	const defaultMapStyle: string | StyleSpecification =
		'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

	let {
		mapStyle = defaultMapStyle,
		pitch = 0
	}: { mapStyle: string | StyleSpecification; pitch: number } = $props();
</script>

<MapLibre
	center={[50, 20]}
	zoom={7}
	class="map"
	{pitch}
	standardControls
	style={mapStyle}
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
