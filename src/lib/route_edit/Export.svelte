<script lang="ts">
	import type { RouteEntity } from '$lib/db_data/routes.datatypes';
	import { getUIRoutesManager } from '$lib/db_data/routesData.svelte';
	import { cancelExport, defaultExportOptions } from '$lib/export_utils';
	import { fileSave } from 'browser-fs-access';

	let {
		route,
		disabled = false
	}: {
		route: RouteEntity;
		disabled?: boolean;
	} = $props();

	let uiRoutes = getUIRoutesManager();

	let exportProgress: {
		isExporting: boolean;
		current: number;
		total: number;
		message: string;
		detailedMessage: string;
		percentage: number;
		isCancelling: boolean;
		isExportReady: boolean;
	} = $state({
		isExporting: false,
		current: 0,
		total: 0,
		message: '',
		detailedMessage: '',
		percentage: 0,
		isCancelling: false,
		isExportReady: false
	});

	let archive: { blob: Blob; fileName: string; description: string; extensions: string[] } | null =
		$state(null);

	async function downloadArchive() {
		if (archive) {
			try {
				const fileHandle = await fileSave(archive.blob, {
					fileName: archive.fileName,
					description: archive.description,
					extensions: archive.extensions
				});
				console.log('File saved successfully:', fileHandle);
			} catch (error) {
				console.error('Error saving file:', error);
				alert('Failed to save the exported route. Please try again.');
			}
		} else {
			alert('No export available to download.');
		}
	}

	function cancelExportProcess() {
		exportProgress.isCancelling = true;
		exportProgress.message = 'Cancelling export...';
		exportProgress = { ...exportProgress };

		try {
			exportProgress.isCancelling = true;
			exportProgress.message = 'Cancelling export...';
			cancelExport();
			exportProgress.isExporting = false;
			exportProgress.isCancelling = false;
			exportProgress.percentage = 0;
			exportProgress.current = 0;
			exportProgress.total = 0;
			exportProgress.message = 'Export cancelled';
			exportProgress.detailedMessage = 'User cancelled the export process';
			exportProgress = { ...exportProgress };
			console.log('Export cancelled successfully');
		} catch (error) {
			console.warn('Error during export cancellation:', error);
		}
	}

	async function exportRoute() {
		if (route) {
			exportProgress.isExporting = true;
			exportProgress.current = 0;
			exportProgress.total = 0;
			exportProgress.message = 'Preparing export...';
			exportProgress.detailedMessage = '';
			exportProgress.percentage = 0;
			exportProgress.isCancelling = false;

			try {
				archive = await uiRoutes
					.exportSelectedRoutes([route.id], defaultExportOptions, (progress) => {
						// Don't update progress if we're cancelling
						if (exportProgress.isCancelling) return;

						// Update all progress fields at once to ensure reactivity
						exportProgress.current = progress.current;
						exportProgress.total = progress.total;
						exportProgress.message = progress.message;
						exportProgress.detailedMessage = progress.detailedMessage || '';

						// Calculate percentage with better precision and bounds checking
						if (progress.total > 0) {
							const rawPercentage = (progress.current / progress.total) * 100;
							exportProgress.percentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));
						} else {
							exportProgress.percentage = 0;
						}

						// Force reactivity update
						exportProgress = { ...exportProgress };

						// Console log with both messages
						const consoleMessage = exportProgress.detailedMessage
							? `${exportProgress.message} - ${exportProgress.detailedMessage}`
							: exportProgress.message;
						console.log(
							`Export progress: ${exportProgress.current}/${exportProgress.total} (${exportProgress.percentage}%) - ${consoleMessage}`
						);
					})
					.then((result) => {
						exportProgress.isExportReady = true;
						exportProgress.message = 'Export ready!';
						exportProgress.detailedMessage = 'Click the download button below';
						exportProgress.percentage = 100;
						exportProgress = { ...exportProgress };

						return result;
					});

				// Ensure we reach 100% when complete (only if not cancelled)
				if (!exportProgress.isCancelling) {
					exportProgress.percentage = 100;
					exportProgress.message = 'Export complete!';
					exportProgress.detailedMessage = 'Download should start automatically';
					exportProgress = { ...exportProgress };
				}
			} catch (error) {
				console.error('Export failed:', error);

				// Handle both direct cancellation errors and Comlink-wrapped errors
				const isCancel =
					(error instanceof Error && error.message === 'Export was cancelled') ||
					(error instanceof Error && error.message.includes('Export cancelled by user')) ||
					(error instanceof Error && error.message.includes('Export was cancelled'));

				if (isCancel || exportProgress.isCancelling) {
					exportProgress.message = 'Export cancelled';
					exportProgress.detailedMessage = 'User cancelled the export process';
				} else {
					exportProgress.message = 'Export failed';
					exportProgress.detailedMessage =
						error instanceof Error ? error.message : 'Unknown error occurred';
					alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
				}
				exportProgress = { ...exportProgress };
			} finally {
				// Reset after a brief delay to show completion/cancellation message
				setTimeout(() => {
					exportProgress.isExporting = false;
					exportProgress.isCancelling = false;
					exportProgress.percentage = 0;
					exportProgress.current = 0;
					exportProgress.total = 0;
					exportProgress.message = '';
					exportProgress.detailedMessage = '';
					exportProgress = { ...exportProgress };
				}, 1000);
			}
		}
	}
</script>

<div class="export-container">
	<div class="flex gap-2">
		<button
			type="button"
			onclick={exportRoute}
			disabled={disabled || exportProgress.isExporting}
			class="relative overflow-hidden transition-all duration-300"
			class:opacity-50={disabled}
			class:animate-pulse={exportProgress.isExporting}
		>
			<span class="relative z-10 font-mono">
				{#if exportProgress.isExporting}
					{exportProgress.percentage}%
				{:else}
					Export
				{/if}
				⬇️
			</span>
			{#if exportProgress.isExporting}
				<div
					class="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-400 transition-all duration-500 ease-out"
					style="width: {exportProgress.percentage}%; opacity: 0.4"
				></div>
			{/if}
		</button>
		{#if exportProgress.isExporting && !exportProgress.isCancelling}
			<button
				type="button"
				onclick={cancelExportProcess}
				class="relative overflow-hidden border-red-300 bg-red-100 transition-all duration-200 hover:bg-red-200"
			>
				<span class="relative z-10 font-mono text-red-700"> Cancel ✕ </span>
			</button>
		{/if}
	</div>

	{#if exportProgress.isExporting}
		<div
			class="animate-slide-down my-3 rounded border p-4 shadow-sm"
			class:border-blue-200={!exportProgress.isCancelling}
			class:bg-gradient-to-r={!exportProgress.isCancelling}
			class:from-blue-50={!exportProgress.isCancelling}
			class:to-indigo-50={!exportProgress.isCancelling}
			class:border-orange-200={exportProgress.isCancelling}
			class:bg-orange-50={exportProgress.isCancelling}
		>
			<div class="mb-3 flex items-center gap-3">
				<div
					class="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
					class:border-blue-600={!exportProgress.isCancelling}
					class:border-orange-600={exportProgress.isCancelling}
				></div>
				<div class="flex-1">
					<div
						class="text-sm font-medium"
						class:text-blue-800={!exportProgress.isCancelling}
						class:text-orange-800={exportProgress.isCancelling}
					>
						{exportProgress.message}
					</div>
					{#if exportProgress.detailedMessage}
						<div
							class="mt-1 text-xs opacity-75"
							class:text-blue-600={!exportProgress.isCancelling}
							class:text-orange-600={exportProgress.isCancelling}
						>
							{exportProgress.detailedMessage}
						</div>
					{/if}
				</div>
			</div>

			{#if exportProgress.total > 0}
				<div class="space-y-3">
					<!-- Enhanced progress bar -->
					<div class="relative h-4 overflow-hidden rounded-md bg-gray-200 shadow-inner">
						<!-- Main progress fill -->
						<div
							class="absolute top-0 left-0 h-full rounded shadow-sm transition-all duration-300 ease-out"
							class:bg-gradient-to-r={!exportProgress.isCancelling}
							class:from-blue-500={!exportProgress.isCancelling}
							class:via-blue-600={!exportProgress.isCancelling}
							class:to-blue-700={!exportProgress.isCancelling}
							class:bg-orange-400={exportProgress.isCancelling}
							style="width: {exportProgress.percentage}%"
						></div>

						<!-- Animated shimmer effect -->
						{#if !exportProgress.isCancelling}
							<div
								class="animate-shimmer-fast absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-40"
								style="width: 40%; transform: translateX({exportProgress.percentage * 2.5}%)"
							></div>
						{/if}

						<!-- Subtle glow effect -->
						<div
							class="absolute top-0 left-0 h-full rounded-full opacity-60 blur-sm transition-all duration-300 ease-out"
							class:bg-gradient-to-r={!exportProgress.isCancelling}
							class:from-blue-400={!exportProgress.isCancelling}
							class:to-blue-500={!exportProgress.isCancelling}
							class:bg-orange-300={exportProgress.isCancelling}
							style="width: {Math.max(0, exportProgress.percentage - 5)}%"
						></div>
					</div>

					<!-- Progress details -->
					<div class="flex items-center justify-between text-xs">
						<div
							class="flex items-center gap-3"
							class:text-blue-700={!exportProgress.isCancelling}
							class:text-orange-700={exportProgress.isCancelling}
						>
							<span
								class="rounded px-2 py-1 font-mono"
								class:bg-blue-100={!exportProgress.isCancelling}
								class:bg-orange-100={exportProgress.isCancelling}
							>
								{exportProgress.current} / {exportProgress.total}
							</span>
							<span
								class:text-blue-500={!exportProgress.isCancelling}
								class:text-orange-500={exportProgress.isCancelling}
							>
								•
							</span>
							<span class:animate-pulse={!exportProgress.isCancelling}>
								{exportProgress.isCancelling ? 'Cancelling...' : 'Processing...'}
							</span>
						</div>
						<div
							class="text-sm font-bold"
							class:text-blue-800={!exportProgress.isCancelling}
							class:text-orange-800={exportProgress.isCancelling}
						>
							{exportProgress.percentage}%
						</div>
					</div>
				</div>
			{:else}
				<!-- Indeterminate loading state -->
				<div class="flex items-center justify-center py-3">
					<div class="flex space-x-2">
						<div
							class="animate-bounce-slow h-3 w-3 rounded-full"
							class:bg-blue-500={!exportProgress.isCancelling}
							class:bg-orange-500={exportProgress.isCancelling}
						></div>
						<div
							class="animate-bounce-slow h-3 w-3 rounded-full"
							class:bg-blue-500={!exportProgress.isCancelling}
							class:bg-orange-500={exportProgress.isCancelling}
							style="animation-delay: 0.15s"
						></div>
						<div
							class="animate-bounce-slow h-3 w-3 rounded-full"
							class:bg-blue-500={!exportProgress.isCancelling}
							class:bg-orange-500={exportProgress.isCancelling}
							style="animation-delay: 0.3s"
						></div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
	{#if exportProgress.isExportReady && archive}
		<div class="mt-4">
			<button
				type="button"
				onclick={downloadArchive}
				class="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
			>
				Download Exported Route
			</button>
		</div>
	{/if}
</div>

<style lang="postcss">
	@reference "../../app.css";
	button {
		@apply rounded border border-slate-300 bg-slate-200 px-2 py-1 shadow-2xs transition-all duration-200;
	}

	button:hover:not(:disabled) {
		@apply bg-slate-300 shadow-xs;
	}

	button:disabled {
		@apply cursor-not-allowed opacity-50;
	}

	@keyframes shimmer-fast {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(200%);
		}
	}

	@keyframes slide-down {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes bounce-slow {
		0%,
		80%,
		100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-8px);
		}
	}

	.animate-shimmer-fast {
		animation: shimmer-fast 1.5s infinite;
	}

	.animate-slide-down {
		animation: slide-down 0.3s ease-out;
	}

	.animate-bounce-slow {
		animation: bounce-slow 2s infinite;
	}
</style>
