<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte.js';
	import SimpleModal from '$lib/components/modals/SimpleModal.svelte';
	import FormModal from '$lib/components/modals/FormModal.svelte';
	import ComplexModal from '$lib/components/modals/ComplexModal.svelte';
	import SlotModal from '$lib/components/modals/SlotModal.svelte';

	function openSimpleModal() {
		modalStore.open({
			id: 'simple-modal',
			title: 'Simple Modal',
			component: SimpleModal,
			props: { name: 'GPX Viewer User' }
		});
	}

	function openFormModal() {
		modalStore.open({
			id: 'form-modal',
			title: 'Contact Form',
			component: FormModal,
			size: 'lg'
		});
	}

	function openComplexModal() {
		modalStore.open({
			id: 'complex-modal',
			title: 'Complex Modal Example',
			component: ComplexModal,
			size: 'xl'
		});
	}

	function openFullscreenModal() {
		modalStore.open({
			id: 'fullscreen-modal',
			title: 'Fullscreen Modal',
			component: SimpleModal,
			props: { name: 'Fullscreen User' },
			size: 'full'
		});
	}

	function openNonClosableModal() {
		modalStore.open({
			id: 'non-closable-modal',
			title: 'Non-Closable Modal',
			component: SimpleModal,
			props: { name: 'Persistent User' },
			closable: false,
			backdrop: false
		});
	}

	function openModalWithSlot() {
		modalStore.open({
			id: 'slot-modal',
			title: 'Modal with Slot Content',
			component: SlotModal,
			size: 'md'
		});
	}
</script>

<svelte:head>
	<title>Modal Demo - Svelte Local GPX Viewer</title>
</svelte:head>

<div class="max-w-4xl mx-auto py-8">
	<h1 class="text-3xl font-bold text-stone-800 mb-8">
		Modal System Demo
	</h1>

	<div class="prose prose-stone max-w-none mb-8">
		<p>
			This page demonstrates the modal system capabilities of the Svelte Local GPX Viewer app.
			The modal system supports various configurations and use cases.
		</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<!-- Simple Modal -->
		<div class="bg-white p-6 rounded-lg shadow-md border border-stone-200">
			<h3 class="text-lg font-semibold text-stone-800 mb-3">
				Simple Modal
			</h3>
			<p class="text-stone-600 text-sm mb-4">
				Basic modal with title, content, and close button.
			</p>
			<button
				onclick={openSimpleModal}
				class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
			>
				Open Simple Modal
			</button>
		</div>

		<!-- Form Modal -->
		<div class="bg-white p-6 rounded-lg shadow-md border border-stone-200">
			<h3 class="text-lg font-semibold text-stone-800 mb-3">
				Form Modal
			</h3>
			<p class="text-stone-600 text-sm mb-4">
				Modal containing a form with validation and submission.
			</p>
			<button
				onclick={openFormModal}
				class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
			>
				Open Form Modal
			</button>
		</div>

		<!-- Complex Modal -->
		<div class="bg-white p-6 rounded-lg shadow-md border border-stone-200">
			<h3 class="text-lg font-semibold text-stone-800 mb-3">
				Complex Modal
			</h3>
			<p class="text-stone-600 text-sm mb-4">
				Rich content with nested modals and complex interactions.
			</p>
			<button
				onclick={openComplexModal}
				class="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
			>
				Open Complex Modal
			</button>
		</div>

		<!-- Fullscreen Modal -->
		<div class="bg-white p-6 rounded-lg shadow-md border border-stone-200">
			<h3 class="text-lg font-semibold text-stone-800 mb-3">
				Fullscreen Modal
			</h3>
			<p class="text-stone-600 text-sm mb-4">
				Modal that takes up the full viewport for immersive content.
			</p>
			<button
				onclick={openFullscreenModal}
				class="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
			>
				Open Fullscreen
			</button>
		</div>

		<!-- Non-Closable Modal -->
		<div class="bg-white p-6 rounded-lg shadow-md border border-stone-200">
			<h3 class="text-lg font-semibold text-stone-800 mb-3">
				Non-Closable Modal
			</h3>
			<p class="text-stone-600 text-sm mb-4">
				Modal that cannot be closed by clicking backdrop or escape key.
			</p>
			<button
				onclick={openNonClosableModal}
				class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
			>
				Open Non-Closable
			</button>
		</div>

		<!-- Slot Content Modal -->
		<div class="bg-white p-6 rounded-lg shadow-md border border-stone-200">
			<h3 class="text-lg font-semibold text-stone-800 mb-3">
				Slot Content Modal
			</h3>
			<p class="text-stone-600 text-sm mb-4">
				Modal using slot content instead of a component.
			</p>
			<button
				onclick={openModalWithSlot}
				class="w-full px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
			>
				Open Slot Modal
			</button>
		</div>
	</div>

	<!-- Features Section -->
	<div class="mt-12 bg-stone-50 p-6 rounded-lg">
		<h2 class="text-2xl font-semibold text-stone-800 mb-4">
			Modal System Features
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<h3 class="text-lg font-medium text-stone-700 mb-2">
					Sizes
				</h3>
				<ul class="text-stone-600 space-y-1 text-sm">
					<li>• <code>sm</code> - Small modal (max-width: 384px)</li>
					<li>• <code>md</code> - Medium modal (max-width: 448px)</li>
					<li>• <code>lg</code> - Large modal (max-width: 512px)</li>
					<li>• <code>xl</code> - Extra large modal (max-width: 576px)</li>
					<li>• <code>full</code> - Fullscreen modal</li>
				</ul>
			</div>
			<div>
				<h3 class="text-lg font-medium text-stone-700 mb-2">
					Features
				</h3>
				<ul class="text-stone-600 space-y-1 text-sm">
					<li>• Keyboard navigation (ESC to close)</li>
					<li>• Backdrop click to close</li>
					<li>• Custom components or slot content</li>
					<li>• Configurable close behavior</li>
					<li>• Smooth animations</li>
					<li>• Nested modal support</li>
				</ul>
			</div>
		</div>
	</div>

	<!-- API Documentation -->
	<div class="mt-8 bg-white p-6 rounded-lg border border-stone-200">
		<h2 class="text-2xl font-semibold text-stone-800 mb-4">
			Usage Example
		</h2>
		<pre class="bg-stone-100 p-4 rounded text-sm overflow-x-auto"><code>{`import { modalStore } from '$lib/stores/modal.svelte.js';
import MyComponent from './MyComponent.svelte';

// Open a modal
modalStore.open({
	id: 'my-modal',
	title: 'My Modal Title',
	component: MyComponent,
	props: { data: 'value' },
	size: 'lg',
	closable: true,
	backdrop: true
});

// Close the current modal
modalStore.close();

// Close all modals
modalStore.closeAll();`}</code>		</pre>
	</div>
</div>
