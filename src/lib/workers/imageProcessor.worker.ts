import * as Comlink from 'comlink';
import { encode as encodeJPEG } from '@jsquash/jpeg';
import { encode as encodeWebP } from '@jsquash/webp';
import { encode as encodeAVIF } from '@jsquash/avif';
import resize from '@jsquash/resize';
import type { CancellationToken } from './workerManager';

export interface ImageVariant {
    src: string;
    width: number;
    height: number;
    format: 'webp' | 'avif' | 'jpeg' | 'png';
    quality: number;
}

export interface ProcessedImage {
    variants: ImageVariant[];
    fallback: string;
    aspectRatio: number;
    originalWidth: number;
    originalHeight: number;
}

export interface FormatSpecificOptions {
    jpeg?: {
        quality?: number;
        progressive?: boolean;
        optimize_coding?: boolean;
        smoothing?: number;
        color_space?: number;
        quant_table?: number;
        auto_subsample?: boolean;
        chroma_subsample?: number;
    };
    webp?: {
        quality?: number;
        effort?: number;
        method?: number;
        segments?: number;
        sns_strength?: number;
        filter_strength?: number;
        filter_sharpness?: number;
        filter_type?: number;
        autofilter?: number;
        alpha_compression?: number;
        alpha_filtering?: number;
        alpha_quality?: number;
        pass?: number;
        show_compressed?: number;
        preprocessing?: number;
        partitions?: number;
        partition_limit?: number;
        emulate_jpeg_size?: number;
        thread_level?: number;
        low_memory?: number;
        near_lossless?: number;
        exact?: number;
        use_delta_palette?: number;
        use_sharp_yuv?: number;
    };
    avif?: {
        quality?: number;
        speed?: number;
        subsample?: number;
        tile_rows?: number;
        tile_cols?: number;
    };
    png?: {
        // PNG is lossless, so minimal options
        level?: number;
    };
}

export interface ImageProcessingOptions {
    widths?: number[];
    formats?: ('webp' | 'avif' | 'jpeg' | 'png')[];
    quality?: number; // Global fallback quality
    generateFallback?: boolean;
    progressive?: boolean;
    effort?: number;
    formatOptions?: FormatSpecificOptions;
}

const DEFAULT_FORMAT_OPTIONS: Required<FormatSpecificOptions> = {
    jpeg: {
        quality: 80,
        progressive: true,
        optimize_coding: true,
        smoothing: 0,
        color_space: 3, // YCbCr
        quant_table: 3,
        auto_subsample: true,
        chroma_subsample: 2,
    },
    webp: {
        quality: 65, // Lower quality for WebP as it's more efficient
        effort: 4,
        method: 6, // Best compression method
        segments: 4,
        sns_strength: 50,
        filter_strength: 60,
        filter_sharpness: 0,
        filter_type: 1,
        autofilter: 0,
        alpha_compression: 1,
        alpha_filtering: 1,
        alpha_quality: 100,
        pass: 1,
        show_compressed: 0,
        preprocessing: 0,
        partitions: 0,
        partition_limit: 0,
        emulate_jpeg_size: 0,
        thread_level: 0,
        low_memory: 0,
        near_lossless: 100,
        exact: 0,
        use_delta_palette: 0,
        use_sharp_yuv: 0
    },
    avif: {
        quality: 50, // Much lower quality for AVIF as it's very efficient
        speed: 2, // Good balance between speed and compression (0=slowest/best, 8=fastest/worst)
        subsample: 1, // 4:2:0 chroma subsampling
        tile_rows: 0,
        tile_cols: 0
    },
    png: {
        level: 6 // Compression level (0-9)
    }
};

const DEFAULT_OPTIONS: Required<Omit<ImageProcessingOptions, 'formatOptions'>> & { formatOptions: Required<FormatSpecificOptions> } = {
    widths: [400, 800, 1200, 1600],
    formats: ['avif', 'webp', 'jpeg'],
    quality: 80,
    generateFallback: true,
    progressive: true,
    effort: 4,
    formatOptions: DEFAULT_FORMAT_OPTIONS
};

export interface ImageProcessorWorker {
    processImage(imageData: ArrayBuffer, imageName: string, options?: ImageProcessingOptions, cancellationToken?: CancellationToken): Promise<ProcessedImage>;
    terminate(): void;
}

class ImageProcessorWorkerImpl implements ImageProcessorWorker {
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Pre-initialize WASM modules by calling them once
            const testCanvas = new OffscreenCanvas(1, 1);
            const testCtx = testCanvas.getContext('2d');
            if (testCtx) {
                const testImageData = testCtx.createImageData(1, 1);
                
                // Test encoders
                await encodeJPEG(testImageData, { quality: 80 });
                await encodeWebP(testImageData, { quality: 80 });
                await encodeAVIF(testImageData, { quality: 80 });
            }

            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize jSquash encoders:', error);
            throw new Error('jSquash encoders initialization failed');
        }
    }

    private async arrayBufferToImageData(arrayBuffer: ArrayBuffer, cancellationToken?: CancellationToken): Promise<ImageData> {
        // Check for cancellation before processing
        cancellationToken?.throwIfCancelled();

        // Create a blob from the array buffer
        const blob = new Blob([arrayBuffer]);
        
        // Use createImageBitmap (available in workers) instead of Image
        const imageBitmap = await createImageBitmap(blob);
        
        // Check for cancellation after bitmap creation
        cancellationToken?.throwIfCancelled();
        
        // Create OffscreenCanvas and draw the image
        const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            imageBitmap.close();
            throw new Error('Failed to get 2D context from OffscreenCanvas');
        }
        
        ctx.drawImage(imageBitmap, 0, 0);
        
        // Get ImageData
        const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
        
        // Clean up
        imageBitmap.close();
        
        return imageData;
    }

    private async encodeImage(
        imageData: ImageData,
        format: string,
        options: Required<Omit<ImageProcessingOptions, 'formatOptions'>> & { formatOptions: Required<FormatSpecificOptions> },
        cancellationToken?: CancellationToken
    ): Promise<ArrayBuffer> {
        // Check for cancellation before encoding
        cancellationToken?.throwIfCancelled();

        // Add debugging info
        const startTime = performance.now();
        
        let encodedBuffer: ArrayBuffer;
        
        switch (format) {
            case 'jpeg':
                encodedBuffer = await encodeJPEG(imageData, options.formatOptions.jpeg);
                break;
            case 'webp':
                encodedBuffer = await encodeWebP(imageData, options.formatOptions.webp);
                break;
            case 'avif':
                encodedBuffer = await encodeAVIF(imageData, options.formatOptions.avif);
                break;
            case 'png':
                // For PNG, use the level option if available
                const canvas = new OffscreenCanvas(imageData.width, imageData.height);
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Failed to get canvas context');
                
                ctx.putImageData(imageData, 0, 0);
                const blob = await canvas.convertToBlob({ type: 'image/png' });
                encodedBuffer = await blob.arrayBuffer();
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }

        // Check for cancellation after encoding
        cancellationToken?.throwIfCancelled();

        const endTime = performance.now();
        const sizeKB = (encodedBuffer.byteLength / 1024).toFixed(1);
        const duration = (endTime - startTime).toFixed(1);
        
        console.log(`${format.toUpperCase()} ${imageData.width}x${imageData.height}: ${sizeKB}KB (${duration}ms)`);
        
        return encodedBuffer;
    }

    async processImage(imageData: ArrayBuffer, imageName: string, options: ImageProcessingOptions = {}, cancellationToken?: CancellationToken): Promise<ProcessedImage> {
        await this.initialize();

        // Check for cancellation before starting
        cancellationToken?.throwIfCancelled();

        // Merge options with defaults, handling the deep merge for formatOptions
        const mergedFormatOptions: Required<FormatSpecificOptions> = {
            jpeg: { ...DEFAULT_FORMAT_OPTIONS.jpeg, ...options.formatOptions?.jpeg },
            webp: { ...DEFAULT_FORMAT_OPTIONS.webp, ...options.formatOptions?.webp },
            avif: { ...DEFAULT_FORMAT_OPTIONS.avif, ...options.formatOptions?.avif },
            png: { ...DEFAULT_FORMAT_OPTIONS.png, ...options.formatOptions?.png }
        };

        const opts = { 
            ...DEFAULT_OPTIONS, 
            ...options,
            formatOptions: mergedFormatOptions
        };
        
        // Convert ArrayBuffer to ImageData using OffscreenCanvas
        const originalImageData = await this.arrayBufferToImageData(imageData, cancellationToken);
        
        // Check for cancellation after image conversion
        cancellationToken?.throwIfCancelled();
        
        const originalWidth = originalImageData.width;
        const originalHeight = originalImageData.height;
        const aspectRatio = originalWidth / originalHeight;

        const variants: ImageVariant[] = [];
        const createdUrls: string[] = []; // Track URLs for cleanup on cancellation

        console.log(`Processing image: ${imageName} (${originalWidth}x${originalHeight})`);

        try {
            // Generate variants for each width and format combination
            for (const width of opts.widths) {
                // Check for cancellation before each width
                cancellationToken?.throwIfCancelled();

                // Skip if requested width is larger than original
                if (width > originalWidth) continue;

                const height = Math.round(width / aspectRatio);

                // Resize the image for this width
                const resizedImageData = await resize(originalImageData, {
                    width,
                    height,
                    method: 'lanczos3'
                });

                // Check for cancellation after resize and before format processing
                cancellationToken?.throwIfCancelled();

                for (const format of opts.formats) {
                    // Check for cancellation before each format - this is the key addition
                    cancellationToken?.throwIfCancelled();

                    try {
                        // Check again right before encoding (most time-consuming operation)
                        cancellationToken?.throwIfCancelled();
                        
                        const encodedBuffer = await this.encodeImage(resizedImageData, format, opts, cancellationToken);
                        
                        // Check after encoding but before blob creation
                        cancellationToken?.throwIfCancelled();
                        
                        const blob = new Blob([encodedBuffer], {
                            type: this.getMimeType(format)
                        });
                        const url = URL.createObjectURL(blob);
                        createdUrls.push(url);

                        // Get the quality value for this format
                        const formatQuality = opts.formatOptions[format as keyof FormatSpecificOptions]?.quality ?? opts.quality;

                        variants.push({
                            src: url,
                            width,
                            height,
                            format: format as 'webp' | 'avif' | 'jpeg' | 'png',
                            quality: formatQuality
                        });
                    } catch (error) {
                        if (error instanceof Error && (
                            error.message === 'Export cancelled by user' || 
                            error.message.includes('cancelled')
                        )) {
                            throw error; // Re-throw cancellation errors
                        }
                        console.warn(`Failed to encode ${format} variant for ${imageName}:`, error);
                    }
                }
            }

            // Generate fallback (JPEG at medium size)
            let fallback = '';
            if (opts.generateFallback) {
                // Check for cancellation before fallback generation
                cancellationToken?.throwIfCancelled();

                try {
                    const fallbackWidth = Math.min(800, originalWidth);
                    const fallbackHeight = Math.round(fallbackWidth / aspectRatio);
                    
                    const fallbackImageData = await resize(originalImageData, {
                        width: fallbackWidth,
                        height: fallbackHeight,
                        method: 'lanczos3'
                    });

                    // Check for cancellation after fallback resize
                    cancellationToken?.throwIfCancelled();

                    const fallbackBuffer = await encodeJPEG(fallbackImageData, opts.formatOptions.jpeg);
                    
                    // Check after fallback encoding
                    cancellationToken?.throwIfCancelled();

                    const fallbackBlob = new Blob([fallbackBuffer], { type: 'image/jpeg' });
                    fallback = URL.createObjectURL(fallbackBlob);
                    createdUrls.push(fallback);
                } catch (error) {
                    if (error instanceof Error && (
                        error.message === 'Export cancelled by user' || 
                        error.message.includes('cancelled')
                    )) {
                        throw error; // Re-throw cancellation errors
                    }
                    console.warn(`Failed to generate fallback for ${imageName}:`, error);
                }
            }

            return {
                variants,
                fallback,
                aspectRatio,
                originalWidth,
                originalHeight
            };

        } catch (error) {
            // Clean up any created URLs on error or cancellation
            for (const url of createdUrls) {
                URL.revokeObjectURL(url);
            }
            throw error;
        }
    }

    private getMimeType(format: string): string {
        switch (format) {
            case 'jpeg':
                return 'image/jpeg';
            case 'webp':
                return 'image/webp';
            case 'avif':
                return 'image/avif';
            case 'png':
                return 'image/png';
            default:
                return 'image/jpeg';
        }
    }

    terminate(): void {
        this.initialized = false;
        self.close();
    }
}

// Expose the worker via Comlink
Comlink.expose(new ImageProcessorWorkerImpl());