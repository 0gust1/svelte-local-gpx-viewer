<script lang="ts">
	import { page } from '$app/state';
	import { blur, crossfade, draw, fade, fly, scale, slide } from 'svelte/transition';

	import { stylesList, defaultStyle } from '$lib/maplibreStyles';

	import AllRoutes from './AllRoutes.svelte';
	import RouteEdit from './Edit.svelte';
	import RoutePreview from './Preview.svelte';

	let selectedStyle = $state(defaultStyle);
	let pitch = $state(0);

	// we need to use $effect/onMount to access the page.url.searchParams object:
	// it only exists in the browser, not at build time
	let urlSearchParams: URLSearchParams | null = $state(null);
	$effect(() => {
		urlSearchParams = page.url.searchParams;
	});

	let shouldEdit = $derived.by(() => {
		return urlSearchParams?.get('edit') === 'true';
	});

	let shouldPreview = $derived.by(() => {
		return urlSearchParams?.get('preview') === 'true';
	});

	let routeId = $derived.by(() => {
		return urlSearchParams?.get('id');
	});
</script>

<!-- url search: {@debug urlSearchParams} -->

{#if routeId}
	{#if shouldPreview}
		<div transition:fade={{ duration: 50 }}>
			<RoutePreview routeIdToPreview={routeId} {selectedStyle} {pitch} />
		</div>
	{:else if shouldEdit}
		<div transition:fade={{ duration: 50 }}>
			<RouteEdit routeIdToEdit={routeId} {selectedStyle} {pitch} />
		</div>
	{/if}
{:else}
	<div transition:fade={{ duration: 50 }}>
		<AllRoutes {selectedStyle} {pitch} />
	</div>
{/if}
