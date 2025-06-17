<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte.js';

	let formData = $state({
		name: '',
		email: '',
		message: ''
	});

	function handleSubmit(event: Event) {
		event.preventDefault();
		console.log('Form submitted:', formData);
		modalStore.close();
		// You could emit an event or call a callback here
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	<div>
		<label for="name" class="block text-sm font-medium text-stone-700 mb-1">
			Name
		</label>
		<input
			type="text"
			id="name"
			bind:value={formData.name}
			class="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			required
		/>
	</div>
	
	<div>
		<label for="email" class="block text-sm font-medium text-stone-700 mb-1">
			Email
		</label>
		<input
			type="email"
			id="email"
			bind:value={formData.email}
			class="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			required
		/>
	</div>
	
	<div>
		<label for="message" class="block text-sm font-medium text-stone-700 mb-1">
			Message
		</label>
		<textarea
			id="message"
			bind:value={formData.message}
			rows="4"
			class="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			required
		></textarea>
	</div>
	
	<div class="flex gap-2 pt-4">
		<button
			type="submit"
			class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
		>
			Submit
		</button>
		<button
			type="button"
			onclick={() => modalStore.close()}
			class="px-4 py-2 bg-stone-500 text-white rounded hover:bg-stone-600 transition-colors"
		>
			Cancel
		</button>
	</div>
</form>
