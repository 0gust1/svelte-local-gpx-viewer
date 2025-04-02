<script lang="ts">
	import { type RouteEntity } from '$lib/localDB';
	import GeoJsonToGpx from '@dwayneparton/geojson-to-gpx';
	import { getUIRoutesManager } from './routesData.svelte';

	let routeListElem: HTMLDivElement;
	let uiRoutes = getUIRoutesManager();

	function round(value: number, precision: number) {
		const multiplier = Math.pow(10, precision || 0);
		return Math.round(value * multiplier) / multiplier;
	}
	function toggleSelectedRoute(id: number) {
		if (uiRoutes.selectedRoutesIds.has(id)) {
			uiRoutes.selectedRoutesIds.delete(id);
		} else {
			uiRoutes.selectedRoutesIds.add(id);
		}
	}

	async function downloadGPX(id: number) {
		const routeEntity: RouteEntity = await uiRoutes.getRoute(id);
		let gpxData = routeEntity.originalGPXData;
		if (!gpxData) {
			const gpx = GeoJsonToGpx(routeEntity.routeData.route);
			gpxData = new XMLSerializer().serializeToString(gpx);
		}
		const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${routeEntity.name}.gpx`;
		a.click();
		URL.revokeObjectURL(url);
	}
	async function downloadJSON(id: number) {
		const routeEntity: RouteEntity = await uiRoutes.getRoute(id);
		const geoJSONData = JSON.stringify(routeEntity);
		const blob = new Blob([geoJSONData], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${routeEntity.name}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function downloadAllRoutes() {
		await uiRoutes.downloadAllRoutesArchive();
	}

	function handleMenuTrigger(event: MouseEvent | KeyboardEvent) {
		const menu = (event.currentTarget as HTMLElement)?.nextElementSibling as HTMLElement;
		// hide all other menus
		routeListElem.querySelectorAll('.menu').forEach((menu) => {
			(menu as HTMLElement).style.visibility = 'hidden';
		});
		menu.style.visibility = 'visible';
		menu.focus();
	}

	function handleMenuKeyDown(event: KeyboardEvent) {
		const menu = event.currentTarget as HTMLElement;
		const menuItems = Array.from(menu.querySelectorAll('button'));
		let focusedIndex = menuItems.indexOf(document.activeElement as HTMLButtonElement);
		if (event.key === 'ArrowDown') {
			focusedIndex = (focusedIndex + 1) % menuItems.length;
			menuItems[focusedIndex].focus();
		} else if (event.key === 'ArrowUp') {
			focusedIndex = (focusedIndex - 1 + menuItems.length) % menuItems.length;
			menuItems[focusedIndex].focus();
		} else if (event.key === 'Enter' && focusedIndex >= 0) {
			menuItems[focusedIndex].click();
		}
	}

	function handleMenuFocusOut(event: FocusEvent) {
		// if focus is outside the menu (or its subelements), hide it
		if (
			event.currentTarget instanceof HTMLElement &&
			!event.currentTarget.contains(event.relatedTarget as Node)
		) {
			event.currentTarget.style.visibility = 'hidden';
		}
	}
</script>

<!-- {JSON.stringify(uiRoutes.selectedRoutesInfo)} -->

<div class="routes-list-container" bind:this={routeListElem}>
	<div class="routes-list-container-header">
		<span class="text-base leading-10">
			Locally saved routes: ({uiRoutes.routes ? uiRoutes.routes.length : 0})
		</span>

		{#if uiRoutes.selectedRoutesIds.size > 0}
			<div class="ml-4 flex flex-col bg-blue-100 px-2 py-1 text-xs">
				<span>
					<span class="font-semibold">{uiRoutes.selectedRoutesIds.size}</span> selected route(s)
				</span>
				<span class="font-semibold">
					{round(uiRoutes.selectedRoutesInfo.distance, 1)}km (+{round(
						uiRoutes.selectedRoutesInfo.elevation.positive,
						0
					)}m, {round(uiRoutes.selectedRoutesInfo.elevation.negative, 0)}m)
				</span>
			</div>
		{/if}

		<button
			disabled={!uiRoutes.routes || uiRoutes.routes.length === 0}
			class="ml-auto rounded-sm bg-blue-500 px-2 py-1 text-white"
			onclick={downloadAllRoutes}
		>
			Download All Routes (ZIP)
		</button>
	</div>
	<ul class="routes-list">
		{#each uiRoutes.routes as route (route.id)}
			<li>{@render routeItem(route)}</li>
		{:else}
			<li>No routes</li>
		{/each}
	</ul>
</div>

{#snippet routeItem(route: RouteEntity)}
	<div
		class="routes-list-item {route.visible ? '' : 'bg-opacity-50'} {uiRoutes.selectedRoutesIds.has(
			route.id
		)
			? 'selected'
			: ''}"
	>
		<div class="button-set-1">
			<input
				type="checkbox"
				disabled={!route.visible}
				checked={uiRoutes.selectedRoutesIds.has(route.id)}
				onchange={() => {
					toggleSelectedRoute(route.id);
				}}
			/>

			<button
				type="button"
				onclick={() => {
					uiRoutes.deleteRoute(route.id);
				}}
				class="font-bold text-red-500/60">X</button
			>
			<button
				type="button"
				onclick={() => {
					uiRoutes.updateRouteVisibility(route.id, !route.visible);
				}}
				><span class={route.visible ? 'opacity-100' : 'opacity-30'}>👁️</span>
			</button>
		</div>

		<div class="route-details">
			<div class="text-sm leading-tight">{route.name}</div>
			<div class="text-xs font-semibold text-slate-500">
				{round(route.distance, 1)}km (+{round(route.elevation.positive, 0)}m, {round(
					route.elevation.negative,
					0
				)}m)
			</div>
		</div>
		<div class="ml-auto self-center">
			{#if route.routeData.sensors.features.length > 0}
				<span class="flex flex-col text-xs font-semibold text-slate-500 border border-slate-200 rounded-md px-1 py-0.5">
					<span>Sensors Data</span>
					<span class="text-slate-400">({route.routeData.sensors.features.length} points)</span>
				</span>
			{/if}
		</div>
		<div class="self-center">
			<input
				class="h-5 w-5"
				type="color"
				value={route.color}
				onchange={(e) => {
					uiRoutes.updateRouteColor(route.id, (e.target as HTMLInputElement)?.value ?? '#444444');
				}}
			/>
		</div>
		<div class="button-set-2 self-center">
			<button
				type="button"
				class="menu-btn"
				aria-haspopup="menu"
				onclick={handleMenuTrigger}
				onkeydown={handleMenuTrigger}
			>
				&hellip;</button
			>
			{@render contextMenu(route)}
		</div>
	</div>
{/snippet}

{#snippet contextMenu(route: RouteEntity)}
	<div
		class="menu"
		role="menu"
		onkeydown={handleMenuKeyDown}
		onfocusout={handleMenuFocusOut}
		tabindex="0"
	>
		<ul class="">
			<li>
				<button
					role="menuitem"
					type="button"
					title="Download GPX file"
					onclick={() => {
						downloadGPX(route.id);
					}}>↓&nbsp;gpx</button
				>
			</li>
			<li>
				<button
					role="menuitem"
					type="button"
					title="Download GeoJSON file"
					onclick={() => {
						downloadJSON(route.id);
					}}>↓&nbsp;geojson</button
				>
			</li>
		</ul>
	</div>
{/snippet}

<style lang="postcss">
	@reference "../app.css";
	.routes-list-container {
		@applyp font-normal flex;
	}
	.routes-list {
		@apply flex flex-col gap-0.5;
	}
	.routes-list-container-header {
		@apply flex items-center text-sm text-slate-500;
	}

	.routes-list-container-header button {
		@apply text-xs font-semibold;
	}

	button[disabled] {
		@apply cursor-not-allowed opacity-50;
	}

	.routes-list-item {
		@apply flex gap-2 bg-slate-50 py-0.5 pl-1;
	}
	.routes-list-item.selected {
		@apply bg-blue-100/50;
	}
	.routes-list-item:hover {
		@apply bg-slate-100;
	}
	.routes-list-item .route-details {
		@apply flex flex-col justify-center;
	}
	.routes-list-item .button-set-1 {
		@apply flex items-center gap-0.5;
		button {
			@apply w-7 rounded-md border border-slate-200 px-1;
		}
		button:hover {
			@apply bg-white;
		}
	}
	.routes-list-item .button-set-2 {
		@apply my-1 flex grow-0 flex-col items-end gap-1;
		@apply relative;
		.menu {
			visibility: hidden;
			@apply absolute right-6 bottom-0;
			@apply bg-blue-100 text-xs shadow;
		}
		.menu-btn {
			@apply mr-2 text-xl text-slate-500;
		}
		/* .menu-btn + .menu:active,
		.menu-btn:focus + .menu {
			visibility: visible;
		} */
		.menu button {
			@apply w-full p-1 text-left hover:bg-slate-50/70;
		}
	}
</style>
