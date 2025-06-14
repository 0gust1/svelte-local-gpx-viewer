<script lang="ts">
	import type { ExportOptions } from '$lib/db_data/config.datatypes';
	import ImageProcessingConfig from './ImageProcessingConfig.svelte';

	interface Props {
		value: ExportOptions;
		onchange: (value: ExportOptions) => void;
	}

	let { value, onchange }: Props = $props();

	function updateValue(updates: Partial<ExportOptions>) {
		const newValue = { ...value, ...updates };
		onchange(newValue);
	}

	function updateStaticFilesUrls(updates: Partial<ExportOptions['staticFilesUrls']>) {
		updateValue({
			staticFilesUrls: {
				...value.staticFilesUrls,
				...updates
			}
		});
	}

	function updateRouteSimplification(updates: Partial<ExportOptions['routeSimplification']>) {
		updateValue({
			routeSimplification: {
				...value.routeSimplification,
				...updates
			}
		});
	}

	function updateImageProcessing(updates: Partial<ExportOptions['imageProcessing']>) {
		updateValue({
			imageProcessing: {
				...value.imageProcessing,
				...updates
			}
		});
	}
</script>

<div class="space-y-6">
	<h2 class="text-xl font-semibold">Export Options</h2>

	<!-- Static Files URLs -->
	<div class="border border-gray-200 rounded-lg p-4">
		<h3 class="text-lg font-medium mb-3">Static Files URLs</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<label class="block">
				<span class="text-sm font-medium">Files URL Prefix:</span>
				<input
					type="text"
					value={value.staticFilesUrls.filesUrlPrefix}
					oninput={(e) => updateStaticFilesUrls({ filesUrlPrefix: e.currentTarget.value })}
					placeholder="https://example.com/files/"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm font-medium">Files URL Suffix:</span>
				<input
					type="text"
					value={value.staticFilesUrls.filesUrlSuffix}
					oninput={(e) => updateStaticFilesUrls({ filesUrlSuffix: e.currentTarget.value })}
					placeholder="?version=1"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm font-medium">Images URL Prefix:</span>
				<input
					type="text"
					value={value.staticFilesUrls.imagesUrlPrefix}
					oninput={(e) => updateStaticFilesUrls({ imagesUrlPrefix: e.currentTarget.value })}
					placeholder="https://example.com/images/"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm font-medium">Images URL Suffix:</span>
				<input
					type="text"
					value={value.staticFilesUrls.imagesUrlSuffix}
					oninput={(e) => updateStaticFilesUrls({ imagesUrlSuffix: e.currentTarget.value })}
					placeholder="?cache=bust"
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>
		</div>
	</div>

	<!-- Route Simplification -->
	<div class="border border-gray-200 rounded-lg p-4">
		<h3 class="text-lg font-medium mb-3">Route Simplification</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			<label class="block">
				<span class="text-sm font-medium">Tolerance:</span>
				<input
					type="number"
					step="0.00001"
					value={value.routeSimplification.tolerance}
					oninput={(e) => updateRouteSimplification({ tolerance: parseFloat(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
				<p class="text-xs text-gray-500 mt-1">Lower values preserve more detail (e.g., 0.00001)</p>
			</label>

			<label class="flex items-center">
				<input
					type="checkbox"
					checked={value.routeSimplification.highQuality}
					onchange={(e) => updateRouteSimplification({ highQuality: e.currentTarget.checked })}
					class="mr-2"
				/>
				<span class="text-sm">High Quality</span>
			</label>
		</div>
	</div>

	<!-- Image Processing -->
	<div class="border border-gray-200 rounded-lg p-4">
		<h3 class="text-lg font-medium mb-3">Image Processing</h3>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
			<label class="flex items-center">
				<input
					type="checkbox"
					checked={value.imageProcessing.enabled}
					onchange={(e) => updateImageProcessing({ enabled: e.currentTarget.checked })}
					class="mr-2"
				/>
				<span class="text-sm font-medium">Enable Image Processing</span>
			</label>

			<label class="flex items-center">
				<input
					type="checkbox"
					checked={value.imageProcessing.includeOriginal}
					onchange={(e) => updateImageProcessing({ includeOriginal: e.currentTarget.checked })}
					class="mr-2"
				/>
				<span class="text-sm font-medium">Include Original Images</span>
			</label>
		</div>

		{#if value.imageProcessing.enabled}
			<ImageProcessingConfig
				value={value.imageProcessing.options}
				onchange={(options) => updateImageProcessing({ options })}
			/>
		{/if}
	</div>
</div>
