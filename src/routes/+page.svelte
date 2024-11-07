<script lang="ts">
	import GpxUpload from '$lib/GPXUpload.svelte';
	import LocalRoutesList from '$lib/LocalRoutesList.svelte';
	import MapLibreWrapper from '$lib/MapLibreWrapper.svelte';
</script>

<div class="flex w-full gap-3 flex-col sm:flex-row">
	<div class="">
		<GpxUpload />
	</div>
	<div class="grow">
		<LocalRoutesList />
	</div>
</div>

<div class="border w-10/12 mx-auto mt-3">
<MapLibreWrapper />
</div>