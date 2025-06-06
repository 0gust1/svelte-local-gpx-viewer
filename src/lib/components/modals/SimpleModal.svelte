<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte.js';

	let { name = 'User' }: { name?: string } = $props();
</script>

<div class="space-y-4">
	<p class="text-stone-600">
		Hello, <strong>{name}</strong>! This is a simple modal content example.
	</p>
	<p class="text-sm text-stone-500">
		This modal demonstrates basic modal functionality with custom props.
	</p>
	<div class="flex gap-2 pt-4">
		<button
			onclick={() => modalStore.close()}
			class="px-4 py-2 bg-stone-500 text-white rounded hover:bg-stone-600 transition-colors"
		>
			Close
		</button>
	</div>
</div>
