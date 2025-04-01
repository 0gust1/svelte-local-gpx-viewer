<script lang="ts">
	import RoutesUpload from '$lib/RoutesUpload.svelte';
	import { getUIRoutesManager } from '$lib/routesData.svelte';
	import { prepareRoutesFromFiles } from './route_utils.js';

	let files = $state<FileList | null>(null);

	const uiRoutes = getUIRoutesManager();

	$effect(() => {
		if (files) {
			addToGeoJSONRoutes(files);
			files = null;
		}
	});

	async function addToGeoJSONRoutes(files: FileList) {
		const routesAndErrors = await prepareRoutesFromFiles(files);

		for (const routeAndError of routesAndErrors) {
			if (routeAndError.route === null) {
				console.error(`insert in DB: error ${routeAndError.errors}`);
			}else{
				if(routeAndError.errors && routeAndError.errors.length > 0){
					console.warn(`insert in DB: route exists, but errors were reported: ${routeAndError.errors}`);
				}
				uiRoutes.createRoute(routeAndError.route);
			}
		}
	}
</script>

<RoutesUpload bind:files />
