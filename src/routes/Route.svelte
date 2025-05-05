<script lang="ts">
  import type { StyleSpecification } from 'maplibre-gl';
	import { base } from '$app/paths';
	import RouteEdit from '$lib/route_edit/RouteEdit.svelte';
	interface Props {
		routeIdToEdit: string;
		selectedStyle: StyleSpecification;
		pitch: number;
	}
	let { routeIdToEdit, selectedStyle, pitch }: Props = $props();
</script>

<a href="{base}/" class=" text-lg font-semibold text-blue-600">&lsaquo; all routes</a>

<div class="mx-auto mt-3">
	<div class="relative">
		<RouteEdit routeId={routeIdToEdit} mapStyle={selectedStyle} {pitch} />
	</div>
</div>
