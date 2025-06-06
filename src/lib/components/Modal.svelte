<script lang="ts">
	import { modalStore, type ModalConfig } from '$lib/stores/modal.svelte.js';
	import { onMount } from 'svelte';

	let { modal }: { modal: ModalConfig } = $props();

	let dialogElement: HTMLDialogElement;
	let isVisible = $state(false);

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && modal.closable) {
			modalStore.close();
		}
	}

	// Handle backdrop click
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialogElement && modal.backdrop && modal.closable) {
			modalStore.close();
		}
	}

	// Size classes mapping
	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		full: 'max-w-none w-full h-full'
	};

	onMount(() => {
		isVisible = true;
		dialogElement.showModal();
		
		return () => {
			if (dialogElement.open) {
				dialogElement.close();
			}
		};
	});

	function closeModal() {
		isVisible = false;
		setTimeout(() => {
			modalStore.close();
		}, 150); // Match animation duration
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<dialog
	bind:this={dialogElement}
	onclick={handleBackdropClick}
	class="backdrop:bg-black/50 backdrop:backdrop-blur-sm p-0 bg-transparent border-none outline-none"
	class:animate-fade-in={isVisible}
	class:animate-fade-out={!isVisible}
>
	<div
		class="bg-white rounded-lg shadow-xl {sizeClasses[modal.size || 'md']} max-h-[90vh] overflow-hidden"
		class:animate-scale-in={isVisible}
		class:animate-scale-out={!isVisible}
	>
		<!-- Modal Header -->
		{#if modal.title || modal.closable}
			<header class="flex items-center justify-between p-4 border-b border-stone-200">
				{#if modal.title}
					<h2 class="text-lg font-semibold text-stone-800">{modal.title}</h2>
				{/if}
				{#if modal.closable}
					<button
						onclick={closeModal}
						class="p-1 rounded-md hover:bg-stone-100 text-stone-500 hover:text-stone-700 transition-colors"
						aria-label="Close modal"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				{/if}
			</header>
		{/if}

		<!-- Modal Content -->
		<div class="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
			{#if modal.component}
				<svelte:component this={modal.component} {...(modal.props || {})} />
			{:else}
				<slot>
					<p class="text-stone-600">No content provided for this modal.</p>
				</slot>
			{/if}
		</div>
	</div>
</dialog>

<style>
	dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		margin: 0;
		z-index: 9999;
	}

	.animate-fade-in {
		animation: fadeIn 0.15s ease-out;
	}

	.animate-fade-out {
		animation: fadeOut 0.15s ease-in;
	}

	.animate-scale-in {
		animation: scaleIn 0.15s ease-out;
	}

	.animate-scale-out {
		animation: scaleOut 0.15s ease-in;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes fadeOut {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.9);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes scaleOut {
		from {
			opacity: 1;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(0.9);
		}
	}
</style>
