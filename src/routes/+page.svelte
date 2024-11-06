<script lang="ts">
	import GpxUpload from '$lib/GPXUpload.svelte';
	import LocalRoutesList from '$lib/LocalRoutesList.svelte';
	import MapLibreWrapper from '$lib/MapLibreWrapper.svelte';
</script>

<h1 class="text-2xl font-light mb-4">Svelte local gpx viewer</h1>
<div class="flex w-full gap-2">
	<div class=" w-1/3">
		<GpxUpload />
	</div>
	<div class="grow">
		<LocalRoutesList />
	</div>
</div>

<p>Routes Viewer</p>
<div class="border">
<MapLibreWrapper />
</div>