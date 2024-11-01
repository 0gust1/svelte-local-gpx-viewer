<script lang="ts">
  import { MapLibre, GeoJSON, LineLayer } from 'svelte-maplibre';
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';

	let geoJSONRoutes = liveQuery(() => db.geoJSONRoutes.toArray());
</script>

<MapLibre
	center={[50, 20]}
	zoom={7}
	class="map"
	standardControls
	style="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
>
	{#if $geoJSONRoutes}
		{#each $geoJSONRoutes as route (route.id)}
			{#if route.data.features.length > 0}
				{#each route.data.features as feature (feature.id)}
					{#if feature.geometry.type === 'LineString'}
						<GeoJSON data={feature} >
						<LineLayer
							layout={{
								'line-cap': 'round',
								'line-join': 'round'
							}}
							paint={{
								'line-color': '#3887be',
								'line-width': 5
							}}
						/>
						</GeoJSON>
					{/if}
				{/each}
			{/if}
		{/each}
	{/if}
</MapLibre>

<style>
	:global(.map) {
		height: 500px;
	}
</style>