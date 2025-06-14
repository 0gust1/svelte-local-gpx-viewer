<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte.js';
</script>

<div class="space-y-4">
	<p class="text-stone-600">
		This modal uses slot content instead of a component. This approach is useful for simple
		content that doesn't warrant a separate component.
	</p>
	<div class="bg-blue-50 p-4 rounded-lg">
		<h4 class="font-medium text-blue-800 mb-2">Slot Benefits</h4>
		<ul class="text-blue-700 text-sm space-y-1">
			<li>• Direct content placement</li>
			<li>• No component overhead</li>
			<li>• Simpler for basic content</li>
		</ul>
	</div>
	<button
		onclick={() => modalStore.close()}
		class="px-4 py-2 bg-stone-500 text-white rounded hover:bg-stone-600 transition-colors"
	>
		Close
	</button>
</div>
