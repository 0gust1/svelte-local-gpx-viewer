<script lang="ts">
import GpxUpload from "$lib/GPXUpload.svelte";
import LocalRoutesList from '$lib/LocalRoutesList.svelte';
import RoutesViewer from '$lib/RoutesViewer.svelte';
</script>

<h1 class="text-xl font-bold">Svelte local gpx viewer</h1>

<p>Upload a gpx file</p>

<GpxUpload/>

<p>Local Routes list</p>

<LocalRoutesList />

<p>Routes Viewer</p>

<RoutesViewer />