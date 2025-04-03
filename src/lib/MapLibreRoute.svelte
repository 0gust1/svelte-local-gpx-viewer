<script lang="ts">
	import { GeoJSON, LineLayer, getMapContext, SymbolLayer } from 'svelte-maplibre';
	import { type RouteEntity } from '$lib/localDB';
	import { onDestroy } from 'svelte';

	interface Props {
		route: RouteEntity;
	}

	let { route: localRouteEntity }: Props = $props();

	const { map, loaded } = $derived(getMapContext());
	$effect(() => {
		if (loaded) {
			map.setPadding({
				top: 30,
				right: 30,
				bottom: 30,
				left: 30
			});
		}
	});

	onDestroy(() => {
		// unsure id this is useful
		if (loaded && !localRouteEntity) {
			map.fitBounds([
				[0, 0],
				[0, 0]
			]);
		}
	});
</script>

{#if localRouteEntity.routeData.route.features.length > 0}
	{#each localRouteEntity.routeData.route.features as feature}
		{#if feature.geometry.type === 'LineString'}
			<GeoJSON data={feature}>
				<LineLayer
					layout={{
						'line-cap': 'round',
						'line-join': 'round'
					}}
					paint={{
						'line-color': localRouteEntity.color ?? '#3887be',
						'line-width': 5,
						'line-opacity': 0.8,
						'line-blur': 0
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
