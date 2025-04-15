<script lang="ts">
	import type { RouteEntity } from '$lib';
	import { getUIRoutesManager } from '$lib/routesData.svelte';
	import Crayon from './Crayon.svelte';

	let { route: localRouteEntity }: { route: RouteEntity } = $props();
	let routeState: RouteEntity = $state(localRouteEntity);
	let hasChanges = $state(false);
	let uiRoutes = getUIRoutesManager();
	let persistencePromise: Promise<number> | null = $state(null);

	let routeDate = $state(formatDate(localRouteEntity.date));
	let createdAt = $state(formatDate(localRouteEntity.createdAt));
	let updatedAt = $state(formatDate(localRouteEntity.updatedAt));

	function formatDate(date: Date | string | undefined): string {
		if (!date) return '';
		return new Date(date).toISOString().slice(0, 10); // Convert to 'YYYY-MM-DD'
	}

	$effect(() => {
		if (createdAt && createdAt !== '') {
			routeState.createdAt = new Date(createdAt);
		}
		if (updatedAt && updatedAt !== '') {
			routeState.updatedAt = new Date(updatedAt);
		}
		if (routeDate && routeDate !== '') {
			routeState.date = new Date(routeDate);
		}
	});

	$effect(() => {
		if (hasChanges) {
			console.log('PERSIST');
			persistencePromise = uiRoutes.updateRoute($state.snapshot(routeState) as RouteEntity);
			// persistencePromise = uiRoutes.updateRoute({} as RouteEntity);
			hasChanges = false;
		}
	});
</script>

{#if persistencePromise !== null}
	{#await persistencePromise}
		<p>Saving...</p>
	{:then pp}
		<p class="text-green-600">Saved {pp}</p>
	{:catch error}
		<p class="text-red-500">Error: {error.message}</p>
	{/await}
{/if}

<Crayon bind:data={routeState} field="name" bind:hasChanges>
	<h2 class="mb-4 text-2xl font-bold">{routeState.name}</h2>
</Crayon>
<p>Description</p>
<Crayon bind:data={routeState} field="description" bind:hasChanges>
	<div class="mb-4">{routeState.description}</div>
</Crayon>
<div class="text-xs">
	<p>Date: <input type="date" bind:value={routeDate} class="text-xs border-0 m-0 p-0" /></p>
	
	<p>Created: <input readonly type="date" bind:value={createdAt} class="text-xs border-0 m-0 p-0" /></p>
	
	<p>Last update: <input readonly type="date" bind:value={updatedAt} class="text-xs border-0 m-0 p-0" /></p>
	
</div>

<div>Here some content ? (markdown ?)</div>

<h3>Photos ({routeState.routeData.photos.features.length})</h3>

<p>Add Photos</p>

<h3>Notes ({routeState.routeData.notes.features.length})</h3>

<p>Add Notes</p>
