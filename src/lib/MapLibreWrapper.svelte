<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
	import type { StyleSpecification } from 'maplibre-gl';
	import {getUIRoutes} from './routesData.svelte'
	import RoutesViewer from '$lib/MapLibreLocalRoutes.svelte';

	const defaultMapStyle: string | StyleSpecification =
		'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

	let uiRoutes = getUIRoutes();	

	let {
		mapStyle = defaultMapStyle,
		pitch = 0
	}: { mapStyle: string | StyleSpecification; pitch: number } = $props();
</script>

{#if uiRoutes}
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
		<RoutesViewer geoJSONRoutes={uiRoutes.routes} />
	</MapLibre>
{/if}

<style>
	:global(.map) {
		height: 500px;
	}
</style>
