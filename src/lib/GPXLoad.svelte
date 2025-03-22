<script lang="ts">
	import RoutesUpload from '$lib/RoutesUpload.svelte';
	import { getUIRoutes } from '$lib/routesData.svelte';
	import { prepareRoutesFromFiles } from '$lib/route_utils';

	let files = $state<FileList | null>(null);

	const uiRoutes = getUIRoutes();

	$effect(() => {
		if (files) {
			addToGeoJSONRoutes(files);
			files = null;
		}
	});

	async function addToGeoJSONRoutes(files: FileList) {
		const routes = await prepareRoutesFromFiles(files);

		for (const route of routes) {
			uiRoutes.createRoute(route);
		}
	}
</script>

<RoutesUpload bind:files />
