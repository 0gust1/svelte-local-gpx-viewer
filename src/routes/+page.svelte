<script lang="ts">
	import GpxLoad from '$lib/GPXLoad.svelte';
	import LocalRoutesList from '$lib/LocalRoutesList.svelte';
	import MapLibreWrapper from '$lib/MapLibreWrapper.svelte';
	import { getUIRoutesManager } from '$lib/routesData.svelte';
	import {stylesList, defaultStyle} from '$lib/maplibreStyles';

	// vatious styles, gathered from:
	// https://gitlab.huma-num.fr/bmericskay/maplibre/-/blob/master/Basemapsmenu.html
	// https://maps.netsyms.net/
	// https://basemaps.cartocdn.com/
	// https://openfreemap.org/quick_start/


	let uiRoutes = getUIRoutesManager();

	let selectedStyle = $state(defaultStyle);
	let pitch = $state(0);

	function round(value: number, precision: number) {
		const multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}
</script>

<h2 class="mb-4 text-2xl font-bold">Geo Routes</h2>
<div class="flex w-full flex-col gap-3 sm:flex-row">
	<div class="py-4">
		<GpxLoad />
	</div>
	<div class="grow">
		<LocalRoutesList />
	</div>
</div>

<div class="mx-auto mt-3 w-10/12 border">
	<div class="grid items-center gap-1 p-1 align-middle text-xs sm:grid-flow-col">
		<label for="map-style">Select Map Style:</label>
		<select id="map-style" bind:value={selectedStyle} class="p-1">
			{#each stylesList as style}
				<option value={style.style}>{style.name}</option>
			{/each}
		</select>

		<label for="map-pitch">Map perspective (pitch): {pitch}</label>
		<input id="map-pitch" type="range" min="0" max="60" step="1" bind:value={pitch} />
	</div>

	<div class="relative">
		{#if uiRoutes.selectedRoutesIds.size > 0}
			<div
				class="absolute right-0 top-0 z-50 flex flex-col rounded-bl-md bg-blue-100 p-2 text-xs shadow-sm"
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
</div>


