<script lang="ts">
	import { MapLibre, type StyleSpecification } from 'svelte-maplibre';
	import RoutesViewer from '$lib/MapLibreRoute.svelte';
	import type { RouteEntity } from '$lib';

	interface Props {
		route: RouteEntity;
		mapStyle: StyleSpecification;
		pitch: number;
		photoSelection: { hovered: number | null; selected: number | null };
	}
	let { route: routeState, mapStyle, pitch, photoSelection }: Props = $props();

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
</script>

<MapLibre
	center={[50, 20]}
	zoom={7}
	class="map"
	{pitch}
	{bounds}
	standardControls
	style={mapStyle}
	images={[
		{
			id: 'arrow_sm',
			url: './arrow_sm.png'
		}
	]}
>
	<RoutesViewer route={routeState} {photoSelection} />
</MapLibre>
