<script lang="ts">
    import type { StyleSpecification } from 'maplibre-gl';
    import type { RouteEntity, RouteInteractivePoint } from '$lib/db_data/routes.datatypes';
    import type { ExportOptions } from '$lib/export_utils';
    import { beforeNavigate } from '$app/navigation';
    import { page } from '$app/state';
    import { onDestroy } from 'svelte';
    import { defaultStyle } from '$lib/maplibreStyles';
    import { getUIRoutesManager } from '$lib/db_data/routesData.svelte';
    import RouteEditMap from './RouteMap.svelte';
    import RouteDataEdit from './RouteDataEdit.svelte';
    import DataPlots from './DataPlots.svelte';
    import { cleanupWorkers } from '$lib/workers/workerManager';
    import { cancelExport, defaultExportOptions } from '$lib/export_utils';

    let {
        routeId,
        mapStyle = defaultStyle,
        pitch = 0
    }: { routeId: string; mapStyle: StyleSpecification; pitch: number } = $props();

    let uiRoutes = getUIRoutesManager();
    let routeState: RouteEntity | null = $state(null);
    let persistencePromise: Promise<number> | null = $state(null);
    let isDirty = $state(false);
    let routeDataEditRef: RouteDataEdit | null = $state(null);

    let photoSelection: { hovered: number | null; selected: number | null } = $state({
        hovered: null,
        selected: null
    });

    let routePoint: RouteInteractivePoint | null = $state(null);

    let exportProgress: {
        isExporting: boolean;
        current: number;
        total: number;
        message: string;
        detailedMessage: string;
        percentage: number;
        isCancelling: boolean;
    } = $state({
        isExporting: false,
        current: 0,
        total: 0,
        message: '',
        detailedMessage: '',
        percentage: 0,
        isCancelling: false
    });

    let routePromise = $derived.by(() => {
        return uiRoutes.getRoute(parseInt(routeId)).then((route) => {
            if (!route) {
                throw new Error(`Route ${routeId} not found`);
            }
            routeState = route;
            isDirty = false; // Reset dirty state when loading a new route
            return true;
        });
    });

    // Cleanup workers on component destroy
    onDestroy(() => {
        cleanupWorkers();
    });

    // Prevent navigation if there are unsaved changes
    beforeNavigate(({ cancel }) => {
        if (isDirty) {
            const shouldLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
            if (!shouldLeave) {
                cancel();
            }
        }
    });

    // Also handle browser refresh/close events
    $effect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (isDirty) {
                event.preventDefault();
                event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return event.returnValue;
            }
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', handleBeforeUnload);

            return () => {
                window.removeEventListener('beforeunload', handleBeforeUnload);
            };
        }
    });

    function saveRoute() {
        if (routeState && isDirty) {
            persistencePromise = uiRoutes.updateRoute($state.snapshot(routeState) as RouteEntity);
            persistencePromise.then((id) => {
                console.log('Saved route with id:', id);
                routeDataEditRef?.markAsSaved();
            });
        }
    }

    function cancelExportProcess() {
        exportProgress.isCancelling = true;
        exportProgress.message = 'Cancelling export...';
        exportProgress = { ...exportProgress };
        
        try {
            cancelExport();
        } catch (error) {
            console.warn('Error during export cancellation:', error);
        }
    }

    async function exportRoute() {
        if (routeState) {
            exportProgress.isExporting = true;
            exportProgress.current = 0;
            exportProgress.total = 0;
            exportProgress.message = 'Preparing export...';
            exportProgress.detailedMessage = '';
            exportProgress.percentage = 0;
            exportProgress.isCancelling = false;

            try {
                await uiRoutes.exportSelectedRoutes([routeState.id], defaultExportOptions, (progress) => {
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
                const isCancel = (error instanceof Error && error.message === 'Export was cancelled') ||
                    (error instanceof Error && error.message.includes('Export cancelled by user')) ||
                    (error instanceof Error && error.message.includes('Export was cancelled'));
                
                if (isCancel || exportProgress.isCancelling) {
                    exportProgress.message = 'Export cancelled';
                    exportProgress.detailedMessage = 'User cancelled the export process';
                } else {
                    exportProgress.message = 'Export failed';
                    exportProgress.detailedMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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

{#await routePromise}
    <h2 class="mb-4 text-2xl font-bold">Loading Route {page.params.id}...</h2>
{:then status}
    {#if status && routeState !== null}
        <div class="grid grid-cols-3 gap-4">
            <div class="text-xs">
                <div class="flex gap-2">
                    <button type="button" onclick={saveRoute} disabled={!isDirty} class:opacity-50={!isDirty}>
                        Save ↩️ {isDirty ? '•' : ''}
                    </button>
                    <button
                        type="button"
                        onclick={exportRoute}
                        disabled={isDirty || exportProgress.isExporting}
                        class="relative overflow-hidden transition-all duration-300"
                        class:opacity-50={isDirty}
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
                            class="relative overflow-hidden transition-all duration-200 bg-red-100 border-red-300 hover:bg-red-200"
                        >
                            <span class="relative z-10 font-mono text-red-700">
                                Cancel ✕
                            </span>
                        </button>
                    {/if}
                    <a href="?preview=true&id={routeState.id}">Preview</a>
                </div>

                {#if exportProgress.isExporting}
                    <div
                        class="animate-slide-down my-3 rounded border shadow-sm p-4"
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
                                        class="text-xs opacity-75 mt-1"
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
                                    <div class="flex items-center gap-3"
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
                                        <span 
                                            class:animate-pulse={!exportProgress.isCancelling}
                                        >
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

                {#if persistencePromise !== null}
                    {#await persistencePromise}
                        <div class="mt-2 flex items-center gap-2 text-blue-600">
                            <div
                                class="h-3 w-3 animate-spin rounded-full border border-blue-600 border-t-transparent"
                            ></div>
                            <p class="text-sm">Saving...</p>
                        </div>
                    {:then pp}
                        <p class="animate-fade-in mt-2 text-sm text-green-600">✓ Saved {pp}</p>
                    {:catch error}
                        <p class="animate-shake mt-2 text-sm text-red-500">✗ Error: {error.message}</p>
                    {/await}
                {/if}

                <RouteDataEdit
                    bind:this={routeDataEditRef}
                    bind:route={routeState}
                    bind:photoSelection
                    bind:isDirty
                />
            </div>
            <div class="col-span-2">
                <RouteEditMap route={routeState} {mapStyle} {pitch} {photoSelection} {routePoint} />
                <DataPlots route={routeState} bind:routePoint />
            </div>
        </div>
    {/if}
{:catch error}
    <p>Error loading route: {error.message}</p>
{/await}

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

    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes shake {
        0%,
        100% {
            transform: translateX(0);
        }
        25% {
            transform: translateX(-4px);
        }
        75% {
            transform: translateX(4px);
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

    .animate-fade-in {
        animation: fade-in 0.3s ease-out;
    }

    .animate-shake {
        animation: shake 0.5s ease-out;
    }
</style>
