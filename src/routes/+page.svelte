<script lang="ts">
	import GpxLoad from '$lib/GPXLoad.svelte';
	import LocalRoutesList from '$lib/LocalRoutesList.svelte';
	import MapLibreWrapper from '$lib/MapLibreWrapper.svelte';
	import { getUIRoutes } from '$lib/routesData.svelte';
	import Readme from '../README.md';

	// vatious styles, gathered from:
	// https://gitlab.huma-num.fr/bmericskay/maplibre/-/blob/master/Basemapsmenu.html
	// https://maps.netsyms.net/
	// https://basemaps.cartocdn.com/
	// https://openfreemap.org/quick_start/
	const stylesList = [
		{ name: 'positron', style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
		{ name: 'osm-liberty 3d (openfreemap)', style: 'https://tiles.openfreemap.org/styles/liberty' },
		{
			name: 'klokantech-freehills (netsym.net)',
			style: 'https://maps.netsyms.net/styles/klokantech-terrain-freehills/style.json'
		},
		{
			name: 'ArcGis hybrid (sat.)',
			style:
				'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json'
		},
		{
			name: 'IGN Std.',
			style: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/standard.json'
		},
		{
			name: 'OSM',
			style:
				'https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json'
		},
		{
			name: 'IGN Att.',
			style: 'https://data.geopf.fr/annexes/ressources/vectorTiles/styles/PLAN.IGN/attenue.json'
		},
		{
			name: 'versatiles-colorful',
			style: 'https://tiles.versatiles.org/assets/styles/colorful.json'
		},
		{
			name: 'Fiord Color',
			style: 'https://openmaptiles.geo.data.gouv.fr/styles/fiord-color/style.json'
		},
		{
			name: 'osm-liberty-hills (netsym.net)',
			style: 'https://maps.netsyms.net/styles/osm-liberty-hillshading/style.json'
		},
		{
			name: 'klokantech 3d (netsym.net)',
			style: 'https://maps.netsyms.net/styles/klokantech-3d/style.json'
		},
		{
			name: 'toner (ICG Catalunya)',
			style: 'https://api.maptiler.com/maps/toner/style.json?key=rrASqj6frF6l2rrOFR4A'
		},
		{ name: 'toner (netsym.net)', style: 'https://maps.netsyms.net/styles/toner/style.json' },
		{ name: 'voyager', style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' },
		{
			name: 'darkmatter',
			style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
		},
		{
			name: 'osm-bright (openfreemap)',
			style: 'https://tiles.openfreemap.org/styles/bright'
		},
		{
			name: 'hibrid (ICG Catalunya)',
			style: 'https://geoserveis.icgc.cat/contextmaps/hibrid.json'
		},
		{ name: 'cassini (netsym.net)', style: 'https://maps.netsyms.net/styles/cassini/style.json' },
		{ name: 'demotiles', style: 'https://demotiles.maplibre.org/style.json' },
		{ name: 'debug', style: 'https://demotiles.maplibre.org/debug-tiles/style.json' }
	];

	let uiRoutes = getUIRoutes();

	let selectedStyle = $state(stylesList[0].style);
	let pitch = $state(0);

	function round(value: number, precision: number) {
		const multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}
</script>

<h2 class="mb-4 text-2xl font-bold">Demo</h2>
<div class="flex w-full flex-col gap-3 sm:flex-row">
	<div class="">
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
				class="absolute right-0 top-0 z-50 flex flex-col rounded-bl-md bg-blue-100 p-2 text-xs shadow"
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

<div class="prose mx-auto mt-6">
	<Readme />
</div>
