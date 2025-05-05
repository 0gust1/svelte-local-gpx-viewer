<script lang="ts">
	import { GeoJSON, LineLayer, getMapContext, SymbolLayer, Marker, CircleLayer } from 'svelte-maplibre';
	
	import { type RouteEntity } from '$lib/db_data/localDB';
	import { onDestroy } from 'svelte';

	interface Props {
		route: RouteEntity;
		photoSelection: {hovered: number | null; selected: number | null};
		routePoint: { coords: [number, number]; distance: number; elevation: number } | null;
	}

	let { route: localRouteEntity, photoSelection, routePoint }: Props = $props();

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
	{#each localRouteEntity.routeData.photos.features as feature,i}
	{@const imageUrl = feature.properties.binaryContent?URL.createObjectURL(feature.properties.binaryContent):null}
		{#if feature.geometry.type === 'LineString'}
			<GeoJSON data={feature}>
				<LineLayer
					layout={{
						'line-cap': 'round',
						'line-join': 'round'
					}}
					paint={{
						'line-color': photoSelection.hovered != null && photoSelection.hovered ==i?`#ff0000`:`#bada55`,
						'line-width': 5,
						'line-opacity': 0.8,
						'line-blur': 0
					}}
				/>
			</GeoJSON>
		{/if}
		{#if feature.geometry.type === 'Point'}
			<GeoJSON data={feature}>
				<CircleLayer
					paint={{
						'circle-radius': 5,
						'circle-color': 'transparent',
						'circle-opacity': 1.0,
						'circle-stroke-width': 2,
						'circle-stroke-color': photoSelection.hovered != null && photoSelection.hovered ==i?`#ff0000`:`transparent`
					}}
				/>
				<div class="relative">
					
				</div>
				<Marker
					anchor="bottom"
					offset={[30, -10]}
					lngLat={feature.geometry.coordinates}
				>
				<div class="relative shadow">
					<svg class="absolute -bottom-3 -left-3 w-8 h-8 z-0">
						<line
							x1="30"
							y1="0"
							x2="0"
							y2="30"
							stroke={photoSelection.hovered != null && photoSelection.hovered ==i?`#ff0000`:`red`}
							stroke-width="2"/>
						<!-- <polygon
								points="0,20 10,0 20,20"
								fill={photoSelection.hovered != null && photoSelection.hovered == i ? `#ff0000` : `#fff`}
						/> -->
				</svg>
				<img
						src={imageUrl}
						alt="Uploaded pic"
						class="relative max-w-10 max-h-10 rounded border-2 border-white outline-1 outline-indigo-300 z-10"
						onload={() => URL.revokeObjectURL(imageUrl)}
				/>
			</div>
				</Marker>
			</GeoJSON>
		{/if}
	{/each}
	{#if routePoint}
		<Marker
			anchor="center"
			lngLat={routePoint.coords}
		>
			<div class=" rounded-full w-3 h-3 bg-amber-400 border-2 border-amber-500"></div>
		</Marker>
		{/if}
{/if}
