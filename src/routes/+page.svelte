<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { blur, crossfade, draw, fade, fly, scale, slide } from 'svelte/transition';
	import GpxLoad from '$lib/GPXLoad.svelte';
	import LocalRoutesList from '$lib/LocalRoutesList.svelte';
	import MapLibreWrapper from '$lib/MapLibreWrapper.svelte';
	import RouteEdit from '$lib/route_edit/RouteEdit.svelte';
	import { getUIRoutesManager } from '$lib/db_data/routesData.svelte';
	import { stylesList, defaultStyle } from '$lib/maplibreStyles';

	let uiRoutes = getUIRoutesManager();

	let selectedStyle = $state(defaultStyle);
	let pitch = $state(0);

	// we need to use $effect/onMount to access the page.url.searchParams object:
	// it only exists in the browser, not at build time 
	let urlSearchParams: URLSearchParams | null = $state(null);
	$effect(() => {
		urlSearchParams = page.url.searchParams;
	});

	let shouldEdit = $derived.by(() => {
		return urlSearchParams?.get('edit') === 'true';
	});

	let routeIdToEdit = $derived.by(() => {
		return urlSearchParams?.get('id');
	});

	function round(value: number, precision: number) {
		const multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}
</script>

<!-- url search: {@debug urlSearchParams} -->


{#if shouldEdit && routeIdToEdit}
	<a href="{base}/" class=" text-lg font-semibold text-blue-600">&lsaquo; all routes</a>

{:else}
	<h2 class="mb-4 text-2xl font-bold">Geo Routes</h2>
{/if}
{#if !shouldEdit || !routeIdToEdit}
	<div class="flex w-full flex-col gap-3 sm:flex-row">
		<div class="py-4">
			<GpxLoad />
		</div>
		<div class="grow">
			<LocalRoutesList />
		</div>
	</div>
{/if}

<div class="mx-auto mt-3">
	<div
		class="mb-4 grid items-center gap-1 border p-1 px-2 py-3 align-middle text-xs sm:grid-flow-col"
	>
		<label for="map-style">Select Map Style:</label>
		<select id="map-style" bind:value={selectedStyle} class="p-1">
			{#each stylesList as style}
				<option value={style.style}>{style.name}</option>
			{/each}
		</select>

		<label for="map-pitch">Map perspective (pitch): {pitch}</label>
		<input id="map-pitch" type="range" min="0" max="60" step="1" bind:value={pitch} />
	</div>

	{#if shouldEdit && routeIdToEdit}
		<div class="relative" transition:fade>
			<RouteEdit routeId={routeIdToEdit} mapStyle={selectedStyle} {pitch} />
		</div>
	{:else}
		<div class="relative">
			{#if uiRoutes.selectedRoutesIds.size > 0}
				<div
					class="absolute top-0 right-0 z-50 flex flex-col rounded-bl-md bg-blue-100 p-2 text-xs shadow-sm"
				>
					<div class="flex flex-col items-end">
						<span>selected routes: {uiRoutes.selectedRoutesIds.size}</span>
						<span class="font-semibold">
							{round(uiRoutes.selectedRoutesInfo.distance, 1)}km (+{round(
								uiRoutes.selectedRoutesInfo.elevation.positive,
								0
							)}m, {round(uiRoutes.selectedRoutesInfo.elevation.negative, 0)}m)
						</span>
					</div>
					<button
						class="rounded-bl-md bg-blue-500 p-1 text-white"
						onclick={() => {
							uiRoutes.selectedRoutesIds.clear();
						}}
					>
						Clear selection
					</button>
				</div>
			{/if}
			<MapLibreWrapper mapStyle={selectedStyle} {pitch} />
		</div>
	{/if}
</div>
