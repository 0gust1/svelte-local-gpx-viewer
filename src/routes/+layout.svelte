<script lang="ts">
	import { version } from '$app/environment';
	import { base } from '$app/paths';
	import '../app.css';
	import ModalManager from '$lib/components/ModalManager.svelte';
	let { children } = $props();
</script>

<header class="site-header">
	<h1 class="title">
		<a href="{base}/">
			<span>Svelte local gpx viewer</span><span class="version">({__APP_VERSION__}-{version})</span>
			<ul class="what-is">
				<li>View and edit GPS routes locally - supports <code>GPX</code>, <code>geoJSON</code> and <code>FIT</code> formats</li>
				<li>Enhance routes with geotagged photos and custom notes</li>
				<li>Embed interactive route maps on any website with reusable components</li>
			</ul>
		</a>
	</h1>
	<nav class="ml-auto mr-4">
	<ul class="flex h-full place-self-end-safe gap-3">
		<li><a href="{base}/modal-demo">Modal Demo</a></li>
		<li><a href="{base}/about">About/help</a></li>
	</ul>
	</nav>
	<a class="github-link mb-1" href="https://github.com/0gust1/svelte-local-gpx-viewer">
		<svg viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg"
			><path
				fill-rule="evenodd"
				clip-rule="evenodd"
				d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
			/></svg
		>
		<span class="text-xs text-stone-500">Gihub repo</span>
	</a>
</header>
<div class="px-2 antialiased">
	{@render children()}
</div>

<!-- Modal Manager -->
<ModalManager />

<style lang="postcss">
	@reference "../app.css";
	.site-header {
		@apply mb-6 border-b border-b-stone-100/30 bg-linear-to-r from-slate-50 to-stone-300 pt-3 pb-1 pl-2 shadow shadow-slate-500/30;
		@apply flex items-end gap-4;
		nav a {
			@apply text-sm text-stone-600 underline hover:text-stone-800 hover:no-underline;
		}
	}
	.title {
		@apply font-light text-stone-600;
		span {
			@apply text-2xl;
		}
		.version {
			@apply ml-2 text-xs text-stone-500;
		}
		.what-is {
			@apply my-2 text-xs text-stone-500 list-disc pl-4;
		}
	}
	.github-link {
		@apply flex flex-col items-center justify-center fill-stone-500 pr-2;
	}
	.github-link:hover {
		@apply fill-stone-600;
	}
	svg {
		@apply block h-10 w-10;
	}
</style>
