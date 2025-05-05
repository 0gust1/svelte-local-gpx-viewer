<script lang="ts">
  import type { StyleSpecification } from 'maplibre-gl';
	import GpxLoad from '$lib/GPXLoad.svelte';
	import LocalRoutesList from '$lib/LocalRoutesList.svelte';
	import MapLibreWrapper from '$lib/MapLibreWrapper.svelte';
  import { getUIRoutesManager } from '$lib/db_data/routesData.svelte';
  import { stylesList, defaultStyle } from '$lib/maplibreStyles';

  interface Props {
    selectedStyle: StyleSpecification;
    pitch: number;
  }
  
  let { selectedStyle, pitch }:Props = $props();
  
  let uiRoutes = getUIRoutesManager();

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

<div class="mx-auto mt-3">
	<div
		class="grid items-center gap-1 border bg-slate-200 px-2 py-1 align-middle text-xs sm:grid-flow-col"
	>
		<label for="map-style" class="mr-2 text-right">Select Map Style:</label>
		<select id="map-style" bind:value={selectedStyle} class="p-1 text-sm">
			{#each stylesList as style}
				<option value={style.style}>{style.name}</option>
			{/each}
		</select>

		<label for="map-pitch" class="mr-2 text-right">Map perspective (pitch): {pitch}</label>
		<input id="map-pitch" type="range" min="0" max="60" step="1" bind:value={pitch} />
	</div>
	<div class="transition:fade relative">
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
</div>
