<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	let { children } = $props();
</script>

<div class="bg-gray-50 antialiased px-2">
	<ParaglideJS {i18n}>
		{@render children()}
	</ParaglideJS>
</div>
