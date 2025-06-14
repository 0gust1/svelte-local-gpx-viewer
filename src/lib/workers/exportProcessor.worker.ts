import * as Comlink from 'comlink';
import { simplify } from '@turf/turf';
import { sanitizeFileName } from '$lib/export_utils';
import type { RouteEntity } from '$lib/db_data/routes.datatypes';
import type { ExportOptions } from '$lib/db_data/config.datatypes';
import type { ImageProcessorWorker } from './imageProcessor.worker';

export interface ExportProgress {
    current: number;
    total: number;
    message: string;
    detailedMessage?: string; // Add detailed message field
}

export interface ProcessedRoute {
    name: string;
    simplifiedGeoJSON: any;
    rawGeoJSON: any;
    originalGPXData?: string;
    originalFitData?: ArrayBuffer;
    photos?: any;
    fullEntity: RouteEntity;
}

export interface ExportProcessorWorker {
    processRoutes(
        routes: RouteEntity[], 
        options: ExportOptions,
        progressCallback: (progress: ExportProgress) => void
    ): Promise<{
        processedRoutes: ProcessedRoute[];
        imageFiles: Map<string, Blob>;
        options: ExportOptions;
    }>;
}

class ExportProcessorWorkerImpl implements ExportProcessorWorker {
    private imageWorker: Worker | null = null;
    private imageWorkerProxy: Comlink.Remote<ImageProcessorWorker> | null = null;

    private async getImageWorker(): Promise<Comlink.Remote<ImageProcessorWorker>> {
        if (!this.imageWorker) {
            this.imageWorker = new Worker(
                new URL('./imageProcessor.worker.ts', import.meta.url),
                { type: 'module' }
            );
            this.imageWorkerProxy = Comlink.wrap(this.imageWorker);
        }
        return this.imageWorkerProxy!;
    }

    private formatImageNameToURL(filename: string, options: ExportOptions) {
        if (options.staticFilesUrls.imagesUrlPrefix === '' && options.staticFilesUrls.imagesUrlSuffix === '') {
            return `images/${filename}`;
        }
        return `${options.staticFilesUrls.filesUrlPrefix}${filename}${options.staticFilesUrls.filesUrlSuffix}`;
    }

    private async processImageBatch(
        photos: any[],
        batchStartIndex: number,
        batchSize: number,
        options: ExportOptions,
        totalPhotos: number,
        routeName: string,
        onProgress?: (current: number, total: number, message: string, detailedMessage?: string) => void
    ): Promise<{ processedPhotos: any[]; imageFiles: Map<string, Blob> }> {
        const imageFiles = new Map<string, Blob>();
        const processedPhotos = [];
        const batchEnd = Math.min(batchStartIndex + batchSize, photos.length);

        for (let i = batchStartIndex; i < batchEnd; i++) {

            const photo = photos[i];
            const globalPhotoIndex = i + 1; // 1-based index

            const mainMessage = `${routeName}: Processing image ${globalPhotoIndex}/${totalPhotos}`;
            const detailedMessage = `Processing ${photo.properties.filename}`;
            
            // Call progress callback with both messages
            onProgress?.(globalPhotoIndex, totalPhotos, mainMessage, detailedMessage);

            if (photo.properties.type !== 'Photo') {
                processedPhotos.push(photo);
                continue;
            }

            const image = photo.properties.binaryContent;
            const imageName = photo.properties.filename;
            const baseImageName = imageName.replace(/\.[^/.]+$/, '');
            const imageExtension = imageName.match(/\.[^/.]+$/)?.[0] || '.jpg';

            // Always add original image
            if (options.imageProcessing?.includeOriginal !== false) {
   
                imageFiles.set(`images/original/${imageName}`, image);
                photo.properties.originalUrl = this.formatImageNameToURL(`original/${imageName}`, options);
            }

            // Process image if enabled
            if (options.imageProcessing?.enabled) {
                try {

                    // Update progress for starting image processing
                    onProgress?.(globalPhotoIndex, totalPhotos, mainMessage, `Converting ${imageName} to processable format...`);

                    const imageWorker = await this.getImageWorker();
                    const imageBuffer = await image.arrayBuffer();
                    
                    // Update progress for actual processing
                    onProgress?.(globalPhotoIndex, totalPhotos, mainMessage, `Generating optimized variants for ${imageName}...`);
                    
                    const processedImage = await imageWorker.processImage(
                        imageBuffer, 
                        imageName, 
                        options.imageProcessing.options
                    );

                    // Create responsive images structure
                    const responsiveImages = {
                        variants: [] as Array<{
                            src: string;
                            width: number;
                            height: number;
                            format: string;
                            quality: number;
                        }>,
                        fallback: '',
                        aspectRatio: processedImage.aspectRatio,
                        originalWidth: processedImage.originalWidth,
                        originalHeight: processedImage.originalHeight
                    };

                    // Add each variant with progress updates
                    for (const [variantIndex, variant] of processedImage.variants.entries()) {

                        const variantName = `${baseImageName}_${variant.width}w.${variant.format}`;
                        const variantPath = `images/responsive/${variantName}`;
                        
                        // Update progress with detailed variant information
                        const variantDetailedMessage = `Creating ${variant.format.toUpperCase()} ${variant.width}px variant for ${imageName}`;
                        onProgress?.(globalPhotoIndex, totalPhotos, mainMessage, variantDetailedMessage);
                        
                        // Fetch the blob from the blob URL
                        const response = await fetch(variant.src);
                        
                        const blob = await response.blob();
                        imageFiles.set(variantPath, blob);

                        // Add variant info with relative path
                        responsiveImages.variants.push({
                            src: this.formatImageNameToURL(`responsive/${variantName}`, options),
                            width: variant.width,
                            height: variant.height,
                            format: variant.format,
                            quality: variant.quality
                        });

                        // Clean up blob URL
                        URL.revokeObjectURL(variant.src);
                    }

                    // Handle fallback image
                    if (processedImage.fallback) {
                        
                        const fallbackName = `${baseImageName}_fallback${imageExtension}`;
                        const fallbackPath = `images/responsive/${fallbackName}`;
                        
                        // Update progress for fallback creation
                        onProgress?.(globalPhotoIndex, totalPhotos, mainMessage, `Generating JPEG fallback for ${imageName}`);
                        
                        const fallbackResponse = await fetch(processedImage.fallback);
                        const fallbackBlob = await fallbackResponse.blob();
                        imageFiles.set(fallbackPath, fallbackBlob);

                        responsiveImages.fallback = this.formatImageNameToURL(`responsive/${fallbackName}`, options);
                        
                        // Clean up blob URL
                        URL.revokeObjectURL(processedImage.fallback);
                    }

                    // Update photo properties with responsive image data
                    photo.properties.responsiveImages = responsiveImages;
                    photo.properties.url = responsiveImages.fallback || responsiveImages.variants[0]?.src || this.formatImageNameToURL(`original/${imageName}`, options);

                } catch (error) {
                    if (error instanceof Error && (
                        error.message === 'Export cancelled by user' ||
                        error.message.includes('cancelled')
                    )) {
                        throw error; // Re-throw cancellation errors
                    }
                    console.warn(`Failed to process image ${imageName}:`, error);
                    // Fallback to original image
                    imageFiles.set(`images/${imageName}`, image);
                    photo.properties.url = this.formatImageNameToURL(imageName, options);
                }
            } else {
                // No processing, just add original
                imageFiles.set(`images/${imageName}`, image);
                photo.properties.url = this.formatImageNameToURL(imageName, options);
            }

            // Remove the binaryContent property
            delete photo.properties.binaryContent;
            processedPhotos.push(photo);
        }

        return { processedPhotos, imageFiles };
    }

    private async processImages(
        photos: any[],
        options: ExportOptions,
        routeName: string,
        onProgress?: (current: number, total: number, message: string, detailedMessage?: string) => void
    ): Promise<{ processedPhotos: any[]; imageFiles: Map<string, Blob> }> {
        const imageFiles = new Map<string, Blob>();
        const processedPhotos = [];
        
        // Process images in batches for better progress feedback
        const batchSize = Math.max(1, Math.min(5, Math.ceil(photos.length / 10))); // Batch size between 1-5, aiming for ~10 progress updates
        const totalPhotos = photos.length;

        for (let i = 0; i < photos.length; i += batchSize) {

            const { processedPhotos: batchProcessedPhotos, imageFiles: batchImageFiles } = 
                await this.processImageBatch(
                    photos,
                    i,
                    batchSize,
                    options,
                    totalPhotos,
                    routeName,
                    onProgress
                );

            processedPhotos.push(...batchProcessedPhotos);
            
            // Merge image files
            for (const [path, blob] of batchImageFiles) {
                imageFiles.set(path, blob);
            }
        }

        return { processedPhotos, imageFiles };
    }

    async processRoutes(
        routes: RouteEntity[], 
        options: ExportOptions,
        progressCallback: (progress: ExportProgress) => void,
    ): Promise<{
        processedRoutes: ProcessedRoute[];
        imageFiles: Map<string, Blob>;
        options: ExportOptions;
    }> {
        const processedRoutes: ProcessedRoute[] = [];
        const allImageFiles = new Map<string, Blob>();

        // Calculate total work units for better progress tracking
        const totalPhotos = routes.reduce((sum, route) => 
            sum + (route.routeData.photos?.features?.length || 0), 0
        );
        const totalWorkUnits = routes.length + totalPhotos; // Routes + photos
        let currentWorkUnit = 0;

        progressCallback({ current: 0, total: totalWorkUnits, message: 'Starting export...', detailedMessage: 'Initializing export process' });

        try {
            for (const [routeIndex, route] of routes.entries()) {

                // Update progress for route processing start
                const routeMainMessage = `Processing route ${routeIndex + 1}/${routes.length}`;
                const routeDetailedMessage = `Simplifying GPS track for "${route.name}"`;
                progressCallback({ 
                    current: currentWorkUnit, 
                    total: totalWorkUnits, 
                    message: routeMainMessage,
                    detailedMessage: routeDetailedMessage
                });

                // Generate simplified GeoJSON (this doesn't need DOM)
                const simplifiedGeoJSON = simplify(route.routeData.route, {
                    tolerance: options.routeSimplification.tolerance,
                    highQuality: options.routeSimplification.highQuality
                });

                currentWorkUnit++; // Count route processing as 1 work unit

                // Process images if they exist
                let processedPhotos = route.routeData.photos?.features || [];
                if (route.routeData.photos?.features && route.routeData.photos.features.length > 0) {
                    const { processedPhotos: photos, imageFiles: routeImageFiles } = await this.processImages(
                        route.routeData.photos.features,
                        options,
                        `Route ${routeIndex + 1}/${routes.length} (${route.name})`,
                        (photoIndex, totalRoutePhotos, message, detailedMessage) => {
                            // Calculate the actual current work unit position
                            // We've already processed currentWorkUnit items, and we're now on photo photoIndex (1-based)
                            const adjustedCurrent = currentWorkUnit + photoIndex - 1;
                            progressCallback({
                                current: Math.min(adjustedCurrent, totalWorkUnits),
                                total: totalWorkUnits,
                                message: message,
                                detailedMessage: detailedMessage || ''
                            });
                        }
                    );
                    processedPhotos = photos;
                    
                    // Add route image files to the global collection
                    // If there are multiple routes, prefix with route name
                    const routePrefix = routes.length > 1 ? `${sanitizeFileName(route.name)}/` : '';
                    for (const [imagePath, imageBlob] of routeImageFiles) {
                        allImageFiles.set(`${routePrefix}${imagePath}`, imageBlob);
                    }

                    // Update work unit counter for processed photos
                    currentWorkUnit += route.routeData.photos.features.length;
                }

                // Create processed route data
                const processedRoute: ProcessedRoute = {
                    name: route.name,
                    simplifiedGeoJSON,
                    rawGeoJSON: route.routeData.route,
                    originalGPXData: route.originalGPXData,
                    originalFitData: route.originalFitData,
                    photos: processedPhotos,
                    fullEntity: {
                        ...route,
                        routeData: {
                            ...route.routeData,
                            photos: processedPhotos.length > 0 ? { 
                                type: 'FeatureCollection', 
                                features: processedPhotos 
                            } : undefined
                        }
                    }
                };

                processedRoutes.push(processedRoute);
            }

            progressCallback({ 
                current: totalWorkUnits, 
                total: totalWorkUnits, 
                message: 'Processing complete!',
                detailedMessage: 'All routes and images have been processed'
            });

            return { processedRoutes, imageFiles: allImageFiles, options };

        } finally {
            // Clean up image worker
            if (this.imageWorker) {
                this.imageWorker.terminate();
                this.imageWorker = null;
                this.imageWorkerProxy = null;
            }
        }
    }
}

// Expose the worker via Comlink
Comlink.expose(new ExportProcessorWorkerImpl());