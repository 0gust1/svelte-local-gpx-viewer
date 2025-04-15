<script lang="ts">
	import { GeoJSON, LineLayer, getMapContext, SymbolLayer } from 'svelte-maplibre';
	import { type RouteEntity } from '$lib/localDB';
	import bbox from '@turf/bbox';
	import { getUIRoutesManager } from './routesData.svelte';
	import { onDestroy } from 'svelte';

	interface Props {
		localRoutes: Array<RouteEntity>;
	}

	let { localRoutes: localRoutesEntities }: Props = $props();
	let uiRoutes = getUIRoutesManager();

	let totalBoundingBox = $derived.by(() => {
		let allFeatures = localRoutesEntities
			.filter((routeEntity) => routeEntity.visible)
			.flatMap((routeEntity) => routeEntity.routeData.route.features);

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

	let selectedBoundingBox = $derived.by(() => {
		let allFeatures = localRoutesEntities
			.filter((routeEntity) => uiRoutes.selectedRoutesIds.has(routeEntity.id))
			.flatMap((routeEntity) => routeEntity.routeData.route.features);

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

	const { map, loaded } = $derived(getMapContext());

	$effect(() => {
		// console.log('bounding box', boundingBox);
		// test if bounding box is correct (array of numbers), because bbox can return [Infinity, Infinity, -Infinity, -Infinity]
		if (
			uiRoutes.selectedRoutesIds.size > 0 &&
			selectedBoundingBox &&
			selectedBoundingBox.every((coord) => Number.isFinite(coord))
		) {
			map.fitBounds(selectedBoundingBox, {
				padding: 40
			});
		} 
		else {
			if (totalBoundingBox && totalBoundingBox.every((coord) => Number.isFinite(coord))) {
				map.fitBounds(totalBoundingBox, {
					padding: 40
				});
			}
		}
	});

	onDestroy(() => {
		// unsure id this is useful
		if (loaded && localRoutesEntities.length === 0) {
			map.fitBounds([
				[0, 0],
				[0, 0]
			]);
		}
	});
</script>

{#each localRoutesEntities.filter((route) => route.visible) as route, index (route.id)}
	{#if route.routeData.route.features.length > 0}
		{#each route.routeData.route.features as feature}
			{#if feature.geometry.type === 'LineString'}
				<GeoJSON data={feature}>
					<LineLayer
						onmouseenter={() => {
							map.getCanvas().style.cursor = 'pointer';
						}}
						onmouseleave={() => {
							map.getCanvas().style.cursor = '';
						}}
						onclick={() => {
							if (uiRoutes.selectedRoutesIds.has(route.id)) {
								// remove the route from the selected routes
								uiRoutes.selectedRoutesIds.delete(route.id);
							} else {
								uiRoutes.selectedRoutesIds.add(route.id);
							}

							console.log(`clicked on line ${index}`);
						}}
						layout={{
							'line-cap': 'round',
							'line-join': 'round'
						}}
						paint={{
							'line-color': route.color ?? '#3887be',
							'line-width': uiRoutes.selectedRoutesIds.has(route.id) ? 8 : 5,
							'line-opacity': uiRoutes.selectedRoutesIds.has(route.id) ? 0.8 : 0.8,
							'line-blur': uiRoutes.selectedRoutesIds.has(route.id)
								? 0
								: uiRoutes.selectedRoutesIds.size > 0
									? 3
									: 0
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
