<script lang="ts">
	import { liveQuery } from 'dexie';
	import { db, type LocalGeoJSONRouteEntity } from '$lib/localDB';

	let geoJSONRoutes = liveQuery<LocalGeoJSONRouteEntity>(() => db.geoJSONRoutes.toArray());

	function round(value: number, precision: number) {
		const multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}
	async function deleteRoute(id: number) {
		await db.geoJSONRoutes.delete(id);
	}
	async function switchVisibility(id: number, visibility: boolean) {
		await db.geoJSONRoutes.update(id, { visible: visibility });
	}
	async function downloadGPX(id: number) {
		const route: LocalGeoJSONRouteEntity = await db.geoJSONRoutes.get(id);
		const gpxData = route.originalGPXData;
		const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${route.name}.gpx`;
		a.click();
		URL.revokeObjectURL(url);
	}
	async function downloadGeoJSON(id: number) {
		const route: LocalGeoJSONRouteEntity = await db.geoJSONRoutes.get(id);
		const geoJSONData = JSON.stringify(route.data);
		const blob = new Blob([geoJSONData], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${route.name}.geojson`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="routes-list-container">
	<p class="routes-list-container-title">
		Locally saved routes: ({$geoJSONRoutes ? $geoJSONRoutes.length : 0})
	</p>
	<ul class="routes-list">
		{#each $geoJSONRoutes as route (route.id)}
			<li>{@render routeItem(route)}</li>
		{:else}
			<li>No routes</li>
		{/each}
	</ul>
</div>

{#snippet routeItem(route: LocalGeoJSONRouteEntity)}
	<div class="routes-list-item {route.visible ? '' : 'bg-opacity-50'}">
		<div class="button-set-1">
			<button
				type="button"
				onclick={() => {
					deleteRoute(route.id);
				}}
				class="font-bold text-red-500/60">X</button
			>
			<button
				type="button"
				onclick={() => {
					switchVisibility(route.id, !route.visible);
				}}
				><span class={route.visible ? 'opacity-100' : 'opacity-30'}>👁️</span>
			</button>
		</div>

		<div class="route-details">
			<div class="text-sm leading-tight">{route.name}</div>
			<div class="text-xs font-semibold text-slate-500">
				{round(route.length, 1)}km (+{round(route.elevation.positive, 0)}m, {round(
					route.elevation.negative,
					0
				)}m)
			</div>
		</div>
		<div class="button-set-2">
			<button
				type="button"
				onclick={() => {
					downloadGPX(route.id);
				}}>↓&nbsp;gpx</button
			>
			<button
				type="button"
				onclick={() => {
					downloadGeoJSON(route.id);
				}}>↓&nbsp;geojson</button
			>
		</div>
	</div>
{/snippet}

<style lang="postcss">
	.routes-list-container {
		@applyp font-normal flex;
	}
	.routes-list {
		@apply flex flex-col gap-0.5;
	}
	.routes-list-container-title {
		@apply text-sm text-slate-500;
	}

	.routes-list-item {
		@apply flex gap-2 bg-slate-50 py-0.5 pl-1;
	}
	.routes-list-item:hover {
		@apply bg-slate-100;
	}
	.routes-list-item .route-details {
		@apply flex flex-col justify-center;
	}
	.routes-list-item .button-set-1 {
		@apply flex items-center gap-0.5;
		button {
			@apply w-7 rounded-md border border-slate-200 px-1;
		}
		button:hover {
			@apply bg-white;
		}
	}
	.routes-list-item .button-set-2 {
		@apply my-1 ml-auto flex grow-0 flex-col items-end gap-1 text-xs;
		button {
			@apply w-full border border-slate-200 bg-blue-400 bg-opacity-20 px-1 text-left;
		}
	}
</style>
