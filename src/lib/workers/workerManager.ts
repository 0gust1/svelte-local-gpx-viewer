import * as Comlink from 'comlink';
import type { ExportProcessorWorker, ExportProgress, ProcessedRoute } from './exportProcessor.worker';
import type { RouteEntity } from '$lib/db_data/routes.datatypes';
import type { ExportOptions } from '$lib/export_utils';


export class WorkerManager {
    private exportWorker: Worker | null = null;
    private exportWorkerProxy: Comlink.Remote<ExportProcessorWorker> | null = null;
    private currentExportId: string | null = null;

    private async getExportWorker(): Promise<Comlink.Remote<ExportProcessorWorker>> {
        if (!this.exportWorker) {
            this.exportWorker = new Worker(
                new URL('./exportProcessor.worker.ts', import.meta.url),
                { type: 'module' }
            );
            this.exportWorkerProxy = Comlink.wrap(this.exportWorker);
        }
        return this.exportWorkerProxy!;
    }

    async processRoutes(
        routes: RouteEntity[],
        options: ExportOptions,
        onProgress?: (progress: ExportProgress) => void
    ): Promise<{ processedRoutes: ProcessedRoute[]; imageFiles: Map<string, Blob>; options: ExportOptions }> {
        // Create new export ID for this export
        this.currentExportId = crypto.randomUUID();
        const exportId = this.currentExportId;
        
        const worker = await this.getExportWorker();

        // Use Comlink to handle the progress callback, always provide a function
        const progressCallback = Comlink.proxy(onProgress ?? (() => {}));
        
        try {
            return await worker.processRoutes(routes, options, progressCallback);
        } catch (error) {
            if (error instanceof Error && error.message === 'Export cancelled by user') {
                throw new Error('Export was cancelled');
            }
            console.error('Export processing failed:', error);
            throw error;
        } finally {
            // Only clear if this is still the current export
            if (this.currentExportId === exportId) {
                this.currentExportId = null;
            }
        }
    }

    cancelExport(): void {
        // Simply clear the current export ID, which will cause all cancellation checks to fail
        this.currentExportId = null;
    }

    isExporting(): boolean {
        return this.currentExportId !== null;
    }

    terminate(): void {
        this.currentExportId = null;
        if (this.exportWorker) {
            // Terminate the worker and clear references
            this.exportWorker.terminate();
            this.exportWorker = null;
            this.exportWorkerProxy = null;
        }
    }
}

// Singleton instance
let workerManager: WorkerManager | null = null;

export function getWorkerManager(): WorkerManager {
    if (!workerManager) {
        workerManager = new WorkerManager();
    }
    return workerManager;
}

export function cleanupWorkers(): void {
    if (workerManager) {
        workerManager.terminate();
        workerManager = null;
    }
}