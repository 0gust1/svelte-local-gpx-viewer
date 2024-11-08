<script lang="ts">
	import { GeoJSON, LineLayer, mapContext } from 'svelte-maplibre';
	import { type LocalGeoJSONRouteEntity } from '$lib/db';
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
			console.log('bounding box', boundingBox);
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
							'line-color': '#3887be',
							'line-width': 5
							// 'line-gap-width': 5
						}}
					/>
				</GeoJSON>
			{/if}
		{/each}
	{/if}
{/each}
