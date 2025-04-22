<script lang="ts">
	import { MapLibre } from 'svelte-maplibre';
	import type { StyleSpecification } from 'maplibre-gl';
	import bbox from '@turf/bbox';
	import { getUIRoutesManager } from '$lib/db_data/routesData.svelte';
	import RoutesViewer from '$lib/MapLibreLocalRoutes.svelte';
	import { defaultStyle } from './maplibreStyles';
	import { getBoundingBox } from './route_utils';

	const defaultMapStyle: string | StyleSpecification = defaultStyle;

	let {
		mapStyle = defaultMapStyle,
		pitch = 0
	}: { mapStyle: string | StyleSpecification; pitch: number } = $props();

	let uiRoutes = getUIRoutesManager();
	let bounds = $derived.by(() => {
		if (uiRoutes.routes && uiRoutes.routes.length > 0) {
			let allFeatures = uiRoutes.routes
				.filter((routeEntity) => routeEntity.visible)
				.flatMap((routeEntity) => routeEntity.routeData.route.features); //remove this one ?

			let boundingBox = bbox({
				type: 'FeatureCollection',
				features: allFeatures
			});
			//if bounding box has 6 elements, it means it is a 3D bounding box, so we need to remove the last 2 elements
			let extendFactor = 0.1;
			let [minX, minY, maxX, maxY] =
				boundingBox.length === 6 ? boundingBox.slice(0, 4) : boundingBox;

			// Extend the bounding box by the given factor
			const width = maxX - minX;
			const height = maxY - minY;

			minX -= width * extendFactor;
			maxX += width * extendFactor;
			minY -= height * extendFactor;
			maxY += height * extendFactor;

			return [minX, minY, maxX, maxY] as [number, number, number, number];
		} else {
			return [-31.266, 34.5, 39.869, 71.185] as [number, number, number, number];
		}
	});
</script>

{#if uiRoutes && uiRoutes.routes}
	<MapLibre
		zoom={7}
		class="map"
		{bounds}
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
