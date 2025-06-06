<script lang="ts">
	import type { StyleSpecification } from 'maplibre-gl';
	import type { RouteEntity, RouteInteractivePoint } from '$lib/db_data/routes.datatypes';

	import { defaultStyle } from '$lib/maplibreStyles';
	import { page } from '$app/state';
	import { getUIRoutesManager } from '$lib/db_data/routesData.svelte';
	import RouteEditMap from './RouteMap.svelte';
	import RouteDataEdit from './RouteDataEdit.svelte';

	import DataPlots from './DataPlots.svelte';

	let {
		routeId,
		mapStyle = defaultStyle,
		pitch = 0
	}: { routeId: string; mapStyle: StyleSpecification; pitch: number } = $props();
	let uiRoutes = getUIRoutesManager();

	let routeState: RouteEntity | null = $state(null);

	let persistencePromise: Promise<number> | null = $state(null);

	let photoSelection: { hovered: number | null; selected: number | null } = $state({
		hovered: null,
		selected: null
	});

	let routePoint: RouteInteractivePoint | null = $state(null);

	//let elevationValues: number[] = routeState.routeData.route.features.filter(f=>f.properties.type='Track Path').map((feature) => feature.geometry.coordinates[2] as number);

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

	let hasChanges = $derived.by(
		() => {
			return true;
		}
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
			uiRoutes.exportSelectedRoutes([routeState.id]);
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
				<RouteEditMap route={routeState} {mapStyle} {pitch} {photoSelection} {routePoint} />
				<DataPlots route={routeState} bind:routePoint />
			</div>
		</div>
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
