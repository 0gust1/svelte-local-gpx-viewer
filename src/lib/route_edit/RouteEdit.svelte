<script lang="ts">
	import { base } from '$app/paths';
	import { defaultStyle } from '$lib/maplibreStyles';
	import type { StyleSpecification } from 'maplibre-gl';
	import { page } from '$app/state';
	import { getUIRoutesManager } from '$lib/db_data/routesData.svelte';
	import RouteEditMap from './RouteEditMap.svelte';
	import RouteDataEdit from './RouteDataEdit.svelte';
	import ObjectDisplay from '$lib/ObjectDisplay.svelte';
	import type { RouteEntity } from '$lib';

	let {
		routeId,
		mapStyle = defaultStyle,
		pitch = 0
	}: { routeId: string; mapStyle: StyleSpecification; pitch: number } = $props();
	let uiRoutes = getUIRoutesManager();

	let routeState: RouteEntity | null = $state(null);

	let persistencePromise: Promise<number> | null = $state(null);

	let sensorsOpen = $state(false);

	let photoSelection: { hovered: number | null; selected: number | null } = $state({
		hovered: null,
		selected: null
	});


	// let hasChanged = $derived.by(() => {
	// 	if (routeState && routeLoaded && changesCount !== null && changesCount > 0) {
	// 		return true;
	// 	}
	// 	return false;
	// });

	let routePromise = $derived.by(() => {
		return uiRoutes.getRoute(parseInt(routeId)).then((route) => {
			if (!route) {
				throw new Error(`Route ${routeId} not found`);
			}
			routeState = route;
			return true;
		});
	});

	let hasChanges = $derived.by(() => {
		return true;}
		// if (routeState && routeLoaded && changesCount !== null && changesCount > 0) {
		// 	return true;
		// 	}
		// 	return false;
		// }
	);

	function saveRoute() {
		if (routeState) {
			persistencePromise = uiRoutes.updateRoute($state.snapshot(routeState) as RouteEntity);
			persistencePromise.then((id) => {
				console.log('Saved route with id:', id);
				//hasChanged = false;
				hasChanges = false;
			});
		}
	}

	function exportRoute() {
		if (routeState) {
			uiRoutes.exportRoute(routeState.id);
		}
	}
</script>

{#await routePromise}
	<h2 class="mb-4 text-2xl font-bold">Loading Route {page.params.id}...</h2>
{:then status}
	{#if status && routeState !== null}
		<div class="grid grid-cols-3 gap-4">
			<div class="text-xs">
				<div class="flex gap-2">
					<!-- <span>{hasChanges}</span> <span>{changeHistory.length}</span> -->
					 <!-- <span>hasChanges: {hasChanges}</span>
					<span>{photoSelection}</span> -->
					<button type="button" onclick={saveRoute}>Save ↩️</button>
					<button type="button" onclick={exportRoute}>Export ⬇️</button>
				</div>
				{#if persistencePromise !== null}
					{#await persistencePromise}
						<p>Saving...</p>
					{:then pp}
						<p class="text-green-600">Saved {pp}</p>
					{:catch error}
						<p class="text-red-500">Error: {error.message}</p>
					{/await}
				{/if}
				<RouteDataEdit bind:route={routeState} bind:photoSelection />
			</div>
			<div class="col-span-2">
				<RouteEditMap route={routeState} {mapStyle} {pitch} {photoSelection} />
			</div>
		</div>

		<details open={sensorsOpen} ontoggle={() => (sensorsOpen = !sensorsOpen)}>
			<summary>Sensor data ({routeState.routeData.sensors.features.length})</summary>
			{#if sensorsOpen}
				<ObjectDisplay data={routeState.routeData.sensors} />
			{/if}
		</details>
	{/if}
{:catch error}
	<p>Error loading route: {error.message}</p>
{/await}

<style lang="postcss">
	@reference "../../app.css";
	button {
		@apply rounded border border-slate-300 bg-slate-200 px-2 py-1 shadow-2xs;
	}
	button:disabled {
		@apply cursor-not-allowed opacity-50;
	}
</style>
