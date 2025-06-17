<script lang="ts">
	import type { PageProps } from './$types';
	import type { AppConfiguration } from '$lib/db_data/config.datatypes';
	import { getConfigManager } from '$lib/stores/configData.svelte';
	import ExportOptionsConfig from '$lib/components/config/ExportOptionsConfig.svelte';
	import { onMount } from 'svelte';

	let { data }: PageProps = $props();
	const configManager = getConfigManager();
	
	let currentConfig: AppConfiguration = $state(data.config);
	let saving = $state(false);
	let saveMessage = $state('');

	// Load current config on mount
	onMount(async () => {
		currentConfig = await configManager.loadConfig();
	});

	async function saveConfig() {
		try {
			saving = true;
			saveMessage = '';
			await configManager.saveConfig($state.snapshot(currentConfig));
			saveMessage = 'Configuration saved successfully!';
			setTimeout(() => {
				saveMessage = '';
			}, 3000);
		} catch (error) {
			console.error('Error saving config:', error);
			saveMessage = 'Error saving configuration. Please try again.';
		} finally {
			saving = false;
		}
	}

	function resetToDefaults() {
		currentConfig = {
			exportOptions: data.defaultExportOptions
		};
	}

	function updateExportOptions(exportOptions: typeof currentConfig.exportOptions) {
		currentConfig = {
			...currentConfig,
			exportOptions
		};
	}
</script>

<svelte:head>
	<title>Configuration - Svelte Local GPX Viewer</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6">
	<header class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900">App Configuration</h1>
		<p class="text-gray-600 mt-2">Configure export options and image processing settings for your routes.</p>
	</header>

	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
		<ExportOptionsConfig
			value={currentConfig.exportOptions}
			onchange={updateExportOptions}
		/>

		<div class="flex gap-4 pt-6 border-t border-gray-200 mt-6">
			<button
				onclick={saveConfig}
				disabled={saving}
				class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{saving ? 'Saving...' : 'Save Configuration'}
			</button>

			<button
				onclick={resetToDefaults}
				class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
			>
				Reset to Defaults
			</button>
		</div>

		{#if saveMessage}
			<div class="mt-4 p-3 rounded-md {saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}">
				{saveMessage}
			</div>
		{/if}
	</div>

	<!-- Debug section (can be removed later) -->
	<details class="mt-8">
		<summary class="cursor-pointer text-sm text-gray-500">Show Current Configuration (Debug)</summary>
		<pre class="mt-2 bg-gray-100 p-4 rounded text-xs overflow-auto">
			{JSON.stringify(currentConfig, null, 2)}
		</pre>
	</details>
</div>