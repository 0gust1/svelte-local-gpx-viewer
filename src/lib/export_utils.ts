import type { RouteEntity } from '$lib/db_data/routes.datatypes';
import { fileSave } from 'browser-fs-access';
import type { ImageProcessingOptions } from './imageProcessor';
import { getWorkerManager } from './workers/workerManager';
import type { ExportProgress, ProcessedRoute } from './workers/exportProcessor.worker';
import GeoJsonToGpx from '@dwayneparton/geojson-to-gpx';
import JSZipConstructor from 'jszip';

export interface ExportOptions {
    filesUrlPrefix: string;
    filesUrlSuffix: string;
    imagesUrlPrefix: string;
    imagesUrlSuffix: string;
    simplifyConfig: {
        tolerance: number;
        highQuality: boolean;
    };
    imageProcessing?: {
        enabled: boolean;
        options?: ImageProcessingOptions;
        includeOriginal?: boolean;
        useWorkers?: boolean;
    };
}

export function sanitizeFileName(fileName: string): string {
    // Normalize to NFC (precomposed form)
    fileName = fileName.normalize('NFC');

    // Replace invalid characters with an underscore
    return fileName
        .replace(/[\s]+/g, '_') // Replace spaces with underscores
        .replace(/[\\/:*?"<>|]/g, '_') // Replace invalid characters
        .replace(/^\.+/, '') // Remove leading dots
        .substring(0, 255); // Limit to 255 characters
}

async function generateZipFromProcessedRoutes(
    processedRoutes: ProcessedRoute[],
    imageFiles: Map<string, Blob>,
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
): Promise<ArrayBuffer> {
    const zip = new JSZipConstructor();
    
    const totalItems = processedRoutes.length + imageFiles.size;
    let currentItem = 0;
    
    onProgress?.({ 
        current: currentItem, 
        total: totalItems, 
        message: 'Creating archive...', 
        detailedMessage: 'Initializing ZIP file structure'
    });

    for (const processedRoute of processedRoutes) {
        onProgress?.({ 
            current: currentItem++, 
            total: totalItems, 
            message: `Adding files for route: ${processedRoute.name}`,
            detailedMessage: `Generating GPX and GeoJSON files for "${processedRoute.name}"`
        });

        const folder = processedRoutes.length > 1 
            ? zip.folder(`${sanitizeFileName(processedRoute.name)}`)
            : zip;

        if (!folder) continue;

        // Generate GPX files (this works in main thread)
        const simplifiedGpx = GeoJsonToGpx(processedRoute.simplifiedGeoJSON);
        const simplifiedGpxData = new XMLSerializer().serializeToString(simplifiedGpx);
        folder.file(`${processedRoute.name}_simplified.gpx`, simplifiedGpxData);

        const rawGpx = GeoJsonToGpx(processedRoute.rawGeoJSON);
        const rawGpxData = new XMLSerializer().serializeToString(rawGpx);
        folder.file(`${processedRoute.name}_raw.gpx`, rawGpxData);

        if (processedRoute.originalGPXData) {
            folder.file(`${processedRoute.name}_original.gpx`, processedRoute.originalGPXData);
        }

        if (processedRoute.originalFitData) {
            const fitData = new Blob([processedRoute.originalFitData], { type: 'application/octet-stream' });
            folder.file(`${processedRoute.name}_original.fit`, fitData);
        }

        // Add GeoJSON file
        const geoJSONData = JSON.stringify(processedRoute.rawGeoJSON, null, 2);
        folder.file(`${processedRoute.name}.geojson`, geoJSONData);

        // Add full entity file
        const fullEntityData = JSON.stringify(processedRoute.fullEntity, null, 2);
        folder.file(`${processedRoute.name}.json`, fullEntityData);
    }

    // Add all image files to the zip
    for (const [imagePath, imageBlob] of imageFiles) {
        onProgress?.({ 
            current: currentItem++, 
            total: totalItems, 
            message: `Adding image: ${imagePath.split('/').pop()}`,
            detailedMessage: `Writing ${imagePath} to archive`
        });
        
        zip.file(imagePath, imageBlob);
    }

    onProgress?.({ 
        current: totalItems, 
        total: totalItems, 
        message: 'Generating zip file...',
        detailedMessage: 'Compressing and finalizing archive'
    });

    // Generate zip as ArrayBuffer
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    
    onProgress?.({ 
        current: totalItems, 
        total: totalItems, 
        message: 'Export complete!',
        detailedMessage: 'Archive created successfully'
    });
    
    return zipBuffer;
}

export async function routesExport(
    routes: RouteEntity[],
    zipName: string,
    zipDescription: string,
    options: ExportOptions,
    onProgress?: (progress: ExportProgress) => void
): Promise<void> {
    const workerManager = getWorkerManager();
    
    try {
        // Process routes in worker (everything except GPX generation)
        const { processedRoutes, imageFiles } = await workerManager.processRoutes(routes, options, onProgress);
        
        // Generate zip in main thread (where we have access to DOM for GPX generation)
        const zipBuffer = await generateZipFromProcessedRoutes(processedRoutes, imageFiles, options, onProgress);
        
        // Generate timestamp for filename
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
            now.getDate()
        ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(
            now.getMinutes()
        ).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

        // Convert ArrayBuffer to Blob
        const blob = new Blob([zipBuffer], { type: 'application/zip' });

        // Save file
        await fileSave(blob, {
            fileName: `${sanitizeFileName(zipName)}_${timestamp}.zip`,
            description: zipDescription,
            extensions: ['.zip']
        });
        
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    }
}

export function cancelExport(): void {
    const workerManager = getWorkerManager();
    workerManager.cancelExport();
}

export function isExporting(): boolean {
    const workerManager = getWorkerManager();
    return workerManager.isExporting();
}
