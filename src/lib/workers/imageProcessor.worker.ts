import * as Comlink from 'comlink';
import { encode as encodeJPEG } from '@jsquash/jpeg';
import { encode as encodeWebP } from '@jsquash/webp';
import { encode as encodeAVIF } from '@jsquash/avif';
import {
	type ImageProcessingOptions,
	DEFAULT_IMAGE_PROCESSING_OPTIONS,
	type FormatSpecificOptions,
	DEFAULT_IMG_ENCODERS_OPTIONS
} from '$lib/db_data/config.datatypes';

import resize from '@jsquash/resize';

export interface ImageVariant {
	src: string;
	width: number;
	height: number;
	format: 'webp' | 'avif' | 'jpeg';
	quality: number;
}

export interface ProcessedImage {
	variants: ImageVariant[];
	fallback: string;
	aspectRatio: number;
	originalWidth: number;
	originalHeight: number;
}

export interface ImageProcessorWorker {
	processImage(
		imageData: ArrayBuffer,
		imageName: string,
		options?: ImageProcessingOptions
	): Promise<ProcessedImage>;
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

	private async arrayBufferToImageData(arrayBuffer: ArrayBuffer): Promise<ImageData> {
		// Create a blob from the array buffer
		const blob = new Blob([arrayBuffer]);

		// Use createImageBitmap (available in workers) instead of Image
		const imageBitmap = await createImageBitmap(blob);

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
		options: Required<Omit<ImageProcessingOptions, 'formatOptions'>> & {
			formatOptions: Required<FormatSpecificOptions>;
		}
	): Promise<ArrayBuffer> {
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
			default:
				throw new Error(`Unsupported format: ${format}`);
		}

		const endTime = performance.now();
		const sizeKB = (encodedBuffer.byteLength / 1024).toFixed(1);
		const duration = (endTime - startTime).toFixed(1);

		console.log(
			`${format.toUpperCase()} ${imageData.width}x${imageData.height}: ${sizeKB}KB (${duration}ms)`
		);

		return encodedBuffer;
	}

	async processImage(
		imageData: ArrayBuffer,
		imageName: string,
		options: ImageProcessingOptions = {}
	): Promise<ProcessedImage> {
		await this.initialize();

		// Merge options with defaults, handling the deep merge for formatOptions
		const mergedFormatOptions: Required<FormatSpecificOptions> = {
			jpeg: { ...DEFAULT_IMG_ENCODERS_OPTIONS.jpeg, ...options.formatOptions?.jpeg },
			webp: { ...DEFAULT_IMG_ENCODERS_OPTIONS.webp, ...options.formatOptions?.webp },
			avif: { ...DEFAULT_IMG_ENCODERS_OPTIONS.avif, ...options.formatOptions?.avif }
		};

		const opts = {
			...DEFAULT_IMAGE_PROCESSING_OPTIONS,
			...options,
			formatOptions: mergedFormatOptions
		};

		// Convert ArrayBuffer to ImageData using OffscreenCanvas
		const originalImageData = await this.arrayBufferToImageData(imageData);

		const originalWidth = originalImageData.width;
		const originalHeight = originalImageData.height;
		const aspectRatio = originalWidth / originalHeight;

		const variants: ImageVariant[] = [];
		const createdUrls: string[] = []; // Track URLs for cleanup on cancellation

		console.log(`Processing image: ${imageName} (${originalWidth}x${originalHeight})`);

		try {
			// Generate variants for each width and format combination
			for (const width of opts.widths) {
				// Skip if requested width is larger than original
				if (width > originalWidth) continue;

				const height = Math.round(width / aspectRatio);

				// Resize the image for this width
				const resizedImageData = await resize(originalImageData, {
					width,
					height,
					method: 'lanczos3'
				});

				for (const format of opts.formats) {
					try {
						const encodedBuffer = await this.encodeImage(resizedImageData, format, opts);

						const blob = new Blob([encodedBuffer], {
							type: this.getMimeType(format)
						});
						const url = URL.createObjectURL(blob);
						createdUrls.push(url);

						// Get the quality value for this format
						const formatQuality =
							opts.formatOptions[format as keyof FormatSpecificOptions]?.quality ?? opts.quality;

						variants.push({
							src: url,
							width,
							height,
							format: format as 'webp' | 'avif' | 'jpeg',
							quality: formatQuality
						});
					} catch (error) {
						if (
							error instanceof Error &&
							(error.message === 'Export cancelled by user' || error.message.includes('cancelled'))
						) {
							throw error; // Re-throw cancellation errors
						}
						console.warn(`Failed to encode ${format} variant for ${imageName}:`, error);
					}
				}
			}

			// Generate fallback (JPEG at medium size)
			let fallback = '';
			if (opts.generateFallback) {
				try {
					const fallbackWidth = Math.min(800, originalWidth);
					const fallbackHeight = Math.round(fallbackWidth / aspectRatio);

					const fallbackImageData = await resize(originalImageData, {
						width: fallbackWidth,
						height: fallbackHeight,
						method: 'lanczos3'
					});

					const fallbackBuffer = await encodeJPEG(fallbackImageData, opts.formatOptions.jpeg);

					const fallbackBlob = new Blob([fallbackBuffer], { type: 'image/jpeg' });
					fallback = URL.createObjectURL(fallbackBlob);
					createdUrls.push(fallback);
				} catch (error) {
					if (
						error instanceof Error &&
						(error.message === 'Export cancelled by user' || error.message.includes('cancelled'))
					) {
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
