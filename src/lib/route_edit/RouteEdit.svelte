<script lang="ts">
	import type { StyleSpecification } from 'maplibre-gl';
	import type { RouteEntity, RouteInteractivePoint } from '$lib/db_data/routes.datatypes';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';

	import { defaultStyle } from '$lib/maplibreStyles';
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
	let isDirty = $state(false);
	let routeDataEditRef: RouteDataEdit | null = $state(null);

	let photoSelection: { hovered: number | null; selected: number | null } = $state({
		hovered: null,
		selected: null
	});

	let routePoint: RouteInteractivePoint | null = $state(null);

	let routePromise = $derived.by(() => {
		return uiRoutes.getRoute(parseInt(routeId)).then((route) => {
			if (!route) {
				throw new Error(`Route ${routeId} not found`);
			}
			routeState = route;
			isDirty = false; // Reset dirty state when loading a new route
			return true;
		});
	});

	// Prevent navigation if there are unsaved changes
	beforeNavigate(({ cancel }) => {
		if (isDirty) {
			const shouldLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
			if (!shouldLeave) {
				cancel();
			}
		}
	});

	// Also handle browser refresh/close events
	$effect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (isDirty) {
				event.preventDefault();
				event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
				return event.returnValue;
			}
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('beforeunload', handleBeforeUnload);
			
			return () => {
				window.removeEventListener('beforeunload', handleBeforeUnload);
			};
		}
	});

	function saveRoute() {
		if (routeState && isDirty) {
			persistencePromise = uiRoutes.updateRoute($state.snapshot(routeState) as RouteEntity);
			persistencePromise.then((id) => {
				console.log('Saved route with id:', id);
				routeDataEditRef?.markAsSaved();
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
					<button 
						type="button" 
						onclick={saveRoute} 
						disabled={!isDirty}
						class:opacity-50={!isDirty}
					>
						Save ↩️ {isDirty ? '•' : ''}
					</button>
					<button 
						type="button" 
						onclick={exportRoute}
						disabled={isDirty}
					>
						Export ⬇️
					</button>
					<a href="?preview=true&id={routeState.id}">Preview</a>
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
				<RouteDataEdit 
					bind:this={routeDataEditRef}
					bind:route={routeState} 
					bind:photoSelection 
					bind:isDirty
				/>
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
