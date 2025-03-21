<script lang="ts">
	import RoutesUpload from '$lib/RoutesUpload.svelte';
	import { getUIRoutes } from '$lib/routesData.svelte';
	import { prepareRoutesFromFiles } from '$lib/route_utils';

	let files = $state<FileList | null>(null);

	const uiRoutes = getUIRoutes();

	async function addToGeoJSONRoutes(files: FileList) {
		const routes = await prepareRoutesFromFiles(files);
		for (const route of routes) {
			uiRoutes.createRoute(route);
		}
	}

	$effect(() => {
		if (files) {
			addToGeoJSONRoutes(files);
			files = null;
		}
	});
</script>

<RoutesUpload bind:files />
