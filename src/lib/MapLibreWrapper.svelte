<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
	import type { StyleSpecification } from 'maplibre-gl';
	import { getUIRoutesManager } from './routesData.svelte';
	import RoutesViewer from '$lib/MapLibreLocalRoutes.svelte';

	const defaultMapStyle: string | StyleSpecification =
		'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

	let uiRoutes = getUIRoutesManager();

	let {
		mapStyle = defaultMapStyle,
		pitch = 0
	}: { mapStyle: string | StyleSpecification; pitch: number } = $props();
</script>

{#if uiRoutes && uiRoutes.routes}
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
		<RoutesViewer localRoutes={uiRoutes.routes} />
	</MapLibre>
{/if}

<style lang="postcss">
	:global(.map) {
		height: 500px;
	}
</style>
