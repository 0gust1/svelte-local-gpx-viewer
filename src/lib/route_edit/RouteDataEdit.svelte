<script lang="ts">
	import type { RouteEntity } from '$lib';
	import Crayon from '$lib/route_edit/Crayon.svelte';
	import ObjectDisplay from '$lib/ObjectDisplay.svelte';
	import PhotosAdd from './PhotosAdd.svelte';

	let {
		route = $bindable(),
		photoSelection = $bindable()
	}: { route: RouteEntity; photoSelection: { hovered: number | null; selected: number | null } } = $props();

	let routeDate = $state(formatDate(route.date));
	let createdAt = $state(formatDate(route.createdAt));
	let updatedAt = $state(formatDate(route.updatedAt));

	function formatDate(date: Date | string | undefined): string {
		if (!date) return '';
		return new Date(date).toISOString().slice(0, 10); // Convert to 'YYYY-MM-DD'
	}

	function formatTime(seconds: number): string {
		seconds = Math.floor(seconds); // Ensure seconds are whole numbers
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = seconds % 60;
		return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}


	// $effect(() => {
	// 	if (createdAt && createdAt !== '') {
	// 		route.createdAt = new Date(createdAt);
	// 	}
	// 	if (updatedAt && updatedAt !== '') {
	// 		route.updatedAt = new Date(updatedAt);
	// 	}
	// 	if (routeDate && routeDate !== '') {
	// 		route.date = new Date(routeDate);
	// 	}
	// });

	// $effect(() => {
	// 	if (hasChanged) {
	// 		console.log('PERSIST');
	// 		persistencePromise = uiRoutes.updateRoute($state.snapshot(route) as RouteEntity);
	// 		// persistencePromise = uiRoutes.updateRoute({} as RouteEntity);
	// 		hasChanged = false;
	// 	}
	// });
</script>

<Crayon bind:dataToEdit={route.name} field={'name'}>
	<h2 class="mb-4 text-2xl font-bold">{route.name}</h2>
</Crayon>
<h3 class="text-sm font-medium text-slate-500">Content (Markdown ?)</h3>
<Crayon bind:dataToEdit={route.textContent} field={'description'}>
	<div class="mb-4 text-sm">{route.textContent}</div>
</Crayon>
<div class="text-xs">
	<p>Date: <input type="date" bind:value={routeDate} class="m-0 border-0 p-0 text-xs" /></p>

	<p>
		Created: <input readonly type="date" bind:value={createdAt} class="m-0 border-0 p-0 text-xs" />
	</p>

	<p>
		Last update: <input
			readonly
			type="date"
			bind:value={updatedAt}
			class="m-0 border-0 p-0 text-xs"
		/>
	</p>
</div>

{#if route.routeData.sensors.features.length > 0}
	<h3 class="inline-block text-lg font-medium">Stats</h3>
	<p>
		HR: {route.routeData.route.properties.avgHeartRate} (avg), {route.routeData.route.properties
			.minHeartRate} (min), {route.routeData.route.properties.maxHeartRate} (max)
	</p>
	<p>
		Speed: {((route.routeData.route.properties.avgSpeed * 60 * 60) / 1000).toFixed(2)} (avg), max: {(
			(route.routeData.route.properties.maxSpeed * 60 * 60) /
			1000
		).toFixed(2)}
	</p>
	<p>
		Total time: {formatTime(route.routeData.route.properties.totalElapsedTime)} ({formatTime(
			route.routeData.route.properties.totalTimerTime
		)} moving)
	</p>
	<details>
		<summary> Details: </summary>
		<ObjectDisplay data={route.routeData.route.properties} />
	</details>
{/if}

<details open={true}>
	<summary>
		<h3 class="inline-block text-lg font-medium">
			Photos ({route.routeData.photos.features.length})
		</h3>
	</summary>
	<PhotosAdd bind:photosToEdit={route.routeData.photos} bind:photoSelection />
</details>

<h3 class="text-lg font-medium">Notes ({route.routeData.notes.features.length})</h3>

<p>Add geotagged Notes ?</p>
