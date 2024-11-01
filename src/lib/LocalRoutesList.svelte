<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db } from '$lib/db';

	let gpxRoutes = liveQuery(() => db.gpxRoutes.toArray());
	let geoJSONRoutes = liveQuery(() => db.geoJSONRoutes.toArray());

	function round(value: number, precision: number) {
		const multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}

	async function deleteRoute(id: number) {
		await db.geoJSONRoutes.delete(id);
	}
</script>

<div class="bg-red-100">
	Gpx routes:
	{#if $gpxRoutes}
		<p>{$gpxRoutes.length}</p>
		<ul>
			{#each $gpxRoutes as route (route.id)}
				<li>
					{route.id}, {route.name}, {route.data.length}
				</li>
			{/each}
		</ul>
	{/if}
	GeoJSON routes:
	{#if $geoJSONRoutes}
		<p>{$geoJSONRoutes.length}</p>
		<ul>
			{#each $geoJSONRoutes as route (route.id)}
				<li>
					<button type="button" onclick={()=>{deleteRoute(route.id)}}>X</button>
					{route.id}, {route.name}, {route.data.features.length}, {round(route.length,1)}km, +{round(route.elevation.positive,0)}m, {round(route.elevation.negative,0)}m
				</li>
			{/each}
		</ul>
	{/if}
</div>
