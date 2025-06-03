<script lang="ts">
	import type { StyleSpecification } from 'maplibre-gl';
	import type { RouteEntity } from '$lib/db_data/routes.datatypes';
	import { base } from '$app/paths';
	import SimpleRoute from '$lib/widgets/SimpleRoute.svelte';

	import { getUIRoutesManager } from '$lib/db_data/routesData.svelte';

	interface Props {
		routeIdToPreview: string;
		selectedStyle: StyleSpecification;
		pitch: number;
	}
	let { routeIdToPreview: routeIdToPreview, selectedStyle, pitch }: Props = $props();

	let uiRoutes = getUIRoutesManager();

	let routeState: RouteEntity | null = $state(null);

	let routePromise = $derived.by(() => {
    console.log(`Fetching route with ID: ${routeIdToPreview}`);
		return uiRoutes.getRoute(parseInt(routeIdToPreview)).then((route) => {
			if (!route) {
				throw new Error(`Route ${routeIdToPreview} not found`);
			}
			routeState = route;
			return true;
		});
	});
</script>

<a href="{base}/" class=" text-lg font-semibold text-blue-600">&lsaquo; all routes</a>

<div class="mx-auto mt-3">
	<div class="relative">
		{#await routePromise}
			<h2 class="mb-4 text-2xl font-bold">Loading Route {routeIdToPreview}...</h2>
		{:then status}
			{#if status && routeState !== null}
      <h3>SimpleRoute component</h3>
				<SimpleRoute route={routeState} mapStyle={selectedStyle} {pitch} />
			{/if}
		{:catch error}
			<h2 class="mb-4 text-2xl font-bold text-red-600">Error loading route: {error.message}</h2>
		{/await}
	</div>
</div>
