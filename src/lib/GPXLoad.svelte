<script lang="ts">
	import RoutesUpload from '$lib/RoutesUpload.svelte';
	import { getUIRoutesManager } from '$lib/db_data/routesData.svelte';
	import { prepareRoutesFromFiles } from './route_utils.js';

	let files = $state<FileList | null>(null);
	let errors = $state<string[]>([]);
	let warnings = $state<string[]>([]);

	const uiRoutes = getUIRoutesManager();

	$effect(() => {
		if (files) {
			addToGeoJSONRoutes(files);
			files = null;
		}
	});

	async function addToGeoJSONRoutes(files: FileList) {
		const routesAndErrors = await prepareRoutesFromFiles(files);
		errors = [];
		warnings = [];

		for (const routeAndError of routesAndErrors) {
			if (routeAndError.route === null) {
				console.error(`insert in DB: ${routeAndError.errors}`);
				errors.push(`insert in DB: ${routeAndError.errors}`);
			} else {
				if (routeAndError.errors && routeAndError.errors.length > 0) {
					console.warn(
						`insert in DB: route exists, but errors were reported: ${routeAndError.errors}`
					);
					warnings.push(
						`insert in DB: route exists, but errors were reported: ${routeAndError.errors}`
					);
				}
				uiRoutes.createRoute(routeAndError.route);
			}
		}
	}
</script>

<RoutesUpload bind:files />

{#if errors.length > 0 || warnings.length > 0}
	<div class="max-w-prose text-xs">
		{#if errors.length > 0}
			<div class="text-red-500">
				{#each errors as error}
					<p>{error}</p>
				{/each}
			</div>
		{/if}
		{#if warnings.length > 0}
			<div class="text-yellow-500">
				{#each warnings as warning}
					<p>{warning}</p>
				{/each}
			</div>
		{/if}
	</div>
{/if}
