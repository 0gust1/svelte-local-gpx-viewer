<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db, type GeoJSONRoute } from '$lib/db';

	let gpxRoutes = liveQuery(() => db.gpxRoutes.toArray());
	let geoJSONRoutes = liveQuery(() => db.geoJSONRoutes.toArray());

	function round(value: number, precision: number) {
		const multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}
	async function deleteRoute(id: number) {
		await db.geoJSONRoutes.delete(id);
	}
	async function switchVisibility(id: number, visibility: boolean) {
		await db.geoJSONRoutes.update(id, { visible: visibility});
	}
</script>

<p>Locally saved routes: ({$geoJSONRoutes ? $geoJSONRoutes.length : 0})</p>
<div class="font-normal">
	<ul>
		{#each $geoJSONRoutes as route (route.id)}
			<li>{@render routeItem(route)}</li>
		{:else}
			<li>No routes</li>
		{/each}
	</ul>
</div>

{#snippet routeItem(route: GeoJSONRoute)}
<div class="flex gap-2 py-0.5 pl-1 bg-green-100 {route.visible?'':"bg-opacity-50"}">
	<button
		type="button"
		onclick={() => {
			deleteRoute(route.id);
		}}
		class="text-red-500"
		>X</button
	>
	<button
		type="button"
		onclick={() => {
			switchVisibility(route.id, !route.visible);
		}}
		><span class="{route.visible?"opacity-100":"opacity-30"}">👁️</span> </button
	>
	<div>
		<div class="text-sm leading-none">{route.name}</div>
		<div class="text-xs font-semibold">
			#{route.id} - {round(route.length, 1)}km, +{round(
				route.elevation.positive,
				0
			)}m, {round(route.elevation.negative, 0)}m
		</div>
	
	</div>
	</div>
{/snippet}
