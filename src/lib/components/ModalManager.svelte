<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte.js';
	import Modal from './Modal.svelte';
</script>

{#if modalStore.activeModal}
	<Modal modal={modalStore.activeModal} />
{/if}
