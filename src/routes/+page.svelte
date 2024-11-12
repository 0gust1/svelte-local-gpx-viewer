<script lang="ts">
	import GpxLoad from '$lib/GPXLoad.svelte';
	import LocalRoutesList from '$lib/LocalRoutesList.svelte';
	import MapLibreWrapper from '$lib/MapLibreWrapper.svelte';
	import Readme from "../README.md";
</script>


<h2 class="text-2xl font-bold mb-4">Demo</h2>
<div class="flex w-full gap-3 flex-col sm:flex-row">
	<div class="">
		<GpxLoad />
	</div>
	<div class="grow">
		<LocalRoutesList />
	</div>
</div>

<div class="border w-10/12 mx-auto mt-3">
<MapLibreWrapper />
</div>

<div class="prose mx-auto mt-6">
	<Readme/>
</div>