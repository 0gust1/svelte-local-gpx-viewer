<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte.js';
	import SimpleModal from './SimpleModal.svelte';
	import FormModal from './FormModal.svelte';

	function openNestedModal() {
		modalStore.open({
			id: 'nested-modal',
			title: 'Nested Modal',
			component: SimpleModal,
			props: { name: 'Nested User' },
			size: 'sm'
		});
	}
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-semibold text-stone-800 mb-2">
			Complex Modal Content
		</h3>
		<p class="text-stone-600 mb-4">
			This modal demonstrates more complex content and interactions.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<div class="space-y-2">
			<h4 class="font-medium text-stone-700">Features</h4>
			<ul class="text-sm text-stone-600 space-y-1">
				<li>• Nested modal support</li>
				<li>• Multiple sizes</li>
				<li>• Custom components</li>
				<li>• Backdrop controls</li>
			</ul>
		</div>
		
		<div class="space-y-2">
			<h4 class="font-medium text-stone-700">Example Data</h4>
			<div class="text-sm text-stone-600">
				<code class="bg-stone-100 px-2 py-1 rounded">
					id: {Math.random().toString(36).substr(2, 9)}
				</code>
			</div>
		</div>
	</div>

	<div class="bg-stone-50 p-4 rounded-lg">
		<h4 class="font-medium text-stone-700 mb-2">Image Preview</h4>
		<div class="w-full h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
			<span class="text-white font-medium">Demo Image Placeholder</span>
		</div>
	</div>

	<div class="flex gap-2 pt-4">
		<button
			onclick={openNestedModal}
			class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
		>
			Open Nested Modal
		</button>
		<button
			onclick={() => modalStore.close()}
			class="px-4 py-2 bg-stone-500 text-white rounded hover:bg-stone-600 transition-colors"
		>
			Close
		</button>
	</div>
</div>
