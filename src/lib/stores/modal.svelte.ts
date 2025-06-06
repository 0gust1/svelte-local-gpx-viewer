/**
 * Modal store for managing modal windows in the app
 * Uses Svelte 5 runes for reactive state management
 */

import type { Component, ComponentProps } from "svelte";

export interface ModalConfig {
	id: string;
	title?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
	closable?: boolean;
	backdrop?: boolean;
	component?: Component;
	props?: ComponentProps<Component>;
}

interface ModalState {
	modals: ModalConfig[];
	activeModal: ModalConfig | null;
}

class ModalStore {
	private state = $state<ModalState>({
		modals: [],
		activeModal: null
	});

	get modals() {
		return this.state.modals;
	}

	get activeModal() {
		return this.state.activeModal;
	}

	get isOpen() {
		return this.state.activeModal !== null;
	}

	/**
	 * Open a modal with the given configuration
	 */
	open(config: ModalConfig) {
		const modal: ModalConfig = {
			closable: true,
			backdrop: true,
			size: 'md',
			...config
		};

		// Close current modal if any
		if (this.state.activeModal) {
			this.close();
		}

		this.state.modals.push(modal);
		this.state.activeModal = modal;
	}

	/**
	 * Close the currently active modal
	 */
	close() {
		if (this.state.activeModal) {
			this.state.modals = this.state.modals.filter(
				m => m.id !== this.state.activeModal!.id
			);
			this.state.activeModal = null;
		}
	}

	/**
	 * Close a specific modal by ID
	 */
	closeById(id: string) {
		const modal = this.state.modals.find(m => m.id === id);
		if (modal) {
			this.state.modals = this.state.modals.filter(m => m.id !== id);
			if (this.state.activeModal?.id === id) {
				this.state.activeModal = null;
			}
		}
	}

	/**
	 * Close all modals
	 */
	closeAll() {
		this.state.modals = [];
		this.state.activeModal = null;
	}
}

export const modalStore = new ModalStore();
