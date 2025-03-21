<script lang="ts">
	import RouteAndImagesLoad from '$lib/RouteAndImagesLoad.svelte';
	import { MapLibre } from 'svelte-maplibre';
	import RoutesViewer from '$lib/MapLibreLocalRoutes.svelte';
	import type { StyleSpecification } from 'maplibre-gl';

	const defaultMapStyle: string | StyleSpecification =
		'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

	let {
		mapStyle = defaultMapStyle,
		pitch = 0
	}: { mapStyle: string | StyleSpecification; pitch: number } = $props();

	let uiRoutes = $state(null);
</script>

<div class="w-2/4">
	<RouteAndImagesLoad route_file={null} image_files={null} />
</div>

{#if uiRoutes}
	<MapLibre
		center={[50, 20]}
		zoom={7}
		class="map"
		standardControls
        style={mapStyle}
        {pitch}
		images={[
			{
				id: 'arrow_sm',
				url: './arrow_sm.png'
			}
		]}
	>
		<RoutesViewer geoJSONRoutes={uiRoutes.routes} />
	</MapLibre>
{/if}
