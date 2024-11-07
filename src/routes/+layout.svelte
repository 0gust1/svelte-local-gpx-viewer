<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	let { children } = $props();
</script>

<h1 class="text-2xl font-light text-stone-600 mb-6 pt-3 pl-2 pb-1 bg-gradient-to-r from-slate-50 to-stone-300  shadow border-b border-b-stone-100/30 shadow-slate-500/30">Svelte local gpx viewer</h1>
<div class="antialiased px-2">
	<ParaglideJS {i18n}>
		{@render children()}
	</ParaglideJS>
</div>
