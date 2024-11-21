<script lang="ts">
	import { GeoJSON, LineLayer, mapContext, SymbolLayer } from 'svelte-maplibre';
	import { type LocalGeoJSONRouteEntity } from '$lib/localDB';
	import bbox from '@turf/bbox';

	let { geoJSONRoutes }: { geoJSONRoutes: Array<LocalGeoJSONRouteEntity> } = $props();

	let boundingBox = $derived.by(() => {
		let allFeatures = geoJSONRoutes
			.filter((route) => route.visible)
			.flatMap((route) => route.data.features);

		const boundingBox = bbox({
			type: 'FeatureCollection',
			features: allFeatures
		});
		//if bounding box has 6 elements, it means it is a 3D bounding box, so we need to remove the last 2 elements
		if (boundingBox.length === 6) {
			return boundingBox.slice(0, 4) as [number, number, number, number];
		} else {
			return boundingBox as [number, number, number, number];
		}
	});

	let { map } = mapContext();

	$effect(() => {
		if ($map) {
			// console.log('bounding box', boundingBox);
			// test if bounding box is correct (array of numbers), because bbox can return [Infinity, Infinity, -Infinity, -Infinity]
			if (boundingBox && boundingBox.every((coord) => Number.isFinite(coord))) {
				$map.fitBounds(boundingBox, {
					padding: 40
				});
			}
		}
	});
</script>

{#each geoJSONRoutes.filter((route) => route.visible) as route (route.id)}
	{#if route.data.features.length > 0}
		{#each route.data.features as feature (feature.id)}
			{#if feature.geometry.type === 'LineString'}
				<GeoJSON data={feature}>
					<LineLayer
						layout={{
							'line-cap': 'round',
							'line-join': 'round'
						}}
						paint={{
							'line-color': route.color ?? '#3887be',
							'line-width': 5,
							'line-opacity': 0.7
						}}
					/>
					<SymbolLayer
						layout={{
							'symbol-placement': 'line',
							'symbol-spacing': 10,
							'icon-image': 'arrow_sm',
							'icon-size': 1,
							'icon-rotate': ['get', 'bearing'],
							'icon-rotation-alignment': 'map',
							'icon-allow-overlap': true
							// 'text-field': '>',
							// 'icon-ignore-placement': true,
						}}
						paint={{
							'icon-opacity': 0.8,
							'icon-halo-width': 4,
							'icon-halo-color': 'black'
						}}
					/>
				</GeoJSON>
			{/if}
		{/each}
	{/if}
{/each}
