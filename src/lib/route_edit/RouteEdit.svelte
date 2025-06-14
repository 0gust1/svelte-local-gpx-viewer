<script lang="ts">
	import type { StyleSpecification } from 'maplibre-gl';
	import type { RouteEntity, RouteInteractivePoint } from '$lib/db_data/routes.datatypes';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import { defaultStyle } from '$lib/maplibreStyles';
	import { getUIRoutesManager } from '$lib/stores/routesData.svelte';
	import RouteEditMap from './RouteMap.svelte';
	import RouteDataEdit from './RouteDataEdit.svelte';
	import DataPlots from './DataPlots.svelte';
	import ExportModal from '$lib/components/modals/ExportModal.svelte';
	import { modalStore } from '$lib/stores/modal.svelte.js';
	import { cleanupWorkers } from '$lib/workers/workerManager';

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

	// Cleanup workers on component destroy
	onDestroy(() => {
		cleanupWorkers();
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

	function openExportModal() {
		if (routeState) {
			modalStore.open({
				id: 'export-modal',
				title: `Export Route: ${routeState.name|| routeState.id}`,
				component: ExportModal as any,
				props: { route: routeState },
				size: 'lg',
				closable: false
			});
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
					<button type="button" onclick={saveRoute} disabled={!isDirty} class:opacity-50={!isDirty}>
						Save ↩️ {isDirty ? '•' : ''}
					</button>
					<button type="button" onclick={openExportModal} disabled={isDirty} class:opacity-50={isDirty}>
						Export ⬇️
					</button>
					<a href="?preview=true&id={routeState.id}">Preview</a>
				</div>

				{#if persistencePromise !== null}
					{#await persistencePromise}
						<div class="mt-2 flex items-center gap-2 text-blue-600">
							<div
								class="h-3 w-3 animate-spin rounded-full border border-blue-600 border-t-transparent"
							></div>
							<p class="text-sm">Saving...</p>
						</div>
					{:then pp}
						<p class="animate-fade-in mt-2 text-sm text-green-600">✓ Saved {pp}</p>
					{:catch error}
						<p class="animate-shake mt-2 text-sm text-red-500">✗ Error: {error.message}</p>
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
		@apply rounded border border-slate-300 bg-slate-200 px-2 py-1 shadow-2xs transition-all duration-200;
	}

	button:hover:not(:disabled) {
		@apply bg-slate-300 shadow-xs;
	}

	button:disabled {
		@apply cursor-not-allowed opacity-50;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes shake {
		0%,
		100% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-4px);
		}
		75% {
			transform: translateX(4px);
		}
	}

	.animate-fade-in {
		animation: fade-in 0.3s ease-out;
	}

	.animate-shake {
		animation: shake 0.5s ease-out;
	}
</style>
