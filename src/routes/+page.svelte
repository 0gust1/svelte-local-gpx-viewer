<script lang="ts">
	import { page } from '$app/state';
	import { blur, crossfade, draw, fade, fly, scale, slide } from 'svelte/transition';

	import { stylesList, defaultStyle } from '$lib/maplibreStyles';

	import AllRoutes from './AllRoutes.svelte';
	import Route from './Route.svelte';

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

	let routeIdToEdit = $derived.by(() => {
		return urlSearchParams?.get('id');
	});
</script>

<!-- url search: {@debug urlSearchParams} -->

{#if shouldEdit && routeIdToEdit}
<div transition:fade={{ duration: 50 }}>
	<Route routeIdToEdit={routeIdToEdit} selectedStyle={selectedStyle} pitch={pitch} />
</div>
{:else}
<div transition:fade={{ duration: 50 }}>
	<AllRoutes selectedStyle={selectedStyle} pitch={pitch} />
</div>
{/if}
