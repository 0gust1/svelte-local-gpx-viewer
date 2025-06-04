import { encode as encodeWebP } from '@jsquash/webp';
import { encode as encodeAvif } from '@jsquash/avif';
import { encode as encodeJpeg } from '@jsquash/jpeg';
import { encode as encodePng } from '@jsquash/png';
import resize from '@jsquash/resize';

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
        level?: number;
    };
}

export interface ImageProcessingOptions {
    widths?: number[];
    formats?: ('webp' | 'avif' | 'jpeg' | 'png')[];
    quality?: number;
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
        color_space: 3,
        quant_table: 3,
        auto_subsample: true,
        chroma_subsample: 2,
    },
    webp: {
        quality: 65,
        effort: 4,
        method: 6,
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
        quality: 50,
        speed: 2,
        subsample: 1,
        tile_rows: 0,
        tile_cols: 0
    },
    png: {
        level: 6
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

export class ImageProcessor {
	private initialized = false;

	async initialize(): Promise<void> {
		if (this.initialized) return;

		try {
			// Pre-initialize WASM modules by calling them once
			// This helps with performance for subsequent calls
			const testCanvas = new OffscreenCanvas(1, 1);
			const testCtx = testCanvas.getContext('2d');
			if (testCtx) {
				const testImageData = testCtx.getImageData(0, 0, 1, 1);

				// Test WebP encoder
				try {
					await encodeWebP(testImageData);
				} catch {
					console.warn('WebP encoder not available');
				}
				// Test AVIF encoder
				try {
					await encodeAvif(testImageData);
				} catch {
					console.warn('AVIF encoder not available');
				}
				// Test JPEG encoder
				try {
					await encodeJpeg(testImageData);
				} catch {
					console.warn('JPEG encoder not available');
				}
				// Test PNG encoder
				try {
					await encodePng(testImageData);
				} catch {
					console.warn('PNG encoder not available');
				}
			}

			this.initialized = true;
		} catch (error) {
			console.error('Failed to initialize jSquash encoders:', error);
			throw new Error('jSquash encoders initialization failed');
		}
	}

	private async generateVariant(
		imageData: ImageData,
		format: string,
		options: Required<Omit<ImageProcessingOptions, 'formatOptions'>> & { formatOptions: Required<FormatSpecificOptions> }
	): Promise<string> {
		let encodedBuffer: ArrayBuffer;

		// Encode based on format with format-specific options
		switch (format) {
			case 'webp':
				encodedBuffer = await encodeWebP(imageData, options.formatOptions.webp);
				break;
			case 'avif':
				encodedBuffer = await encodeAvif(imageData, options.formatOptions.avif);
				break;
			case 'png':
				encodedBuffer = await encodePng(imageData);
				break;
			case 'jpeg':
			default:
				encodedBuffer = await encodeJpeg(imageData, options.formatOptions.jpeg);
				break;
		}

		const blob = new Blob([encodedBuffer], {
			type: this.getMimeType(format)
		});

		// Log compression info
		const sizeKB = (blob.size / 1024).toFixed(1);
		console.log(`${format.toUpperCase()} ${imageData.width}x${imageData.height}: ${sizeKB}KB`);

		return URL.createObjectURL(blob);
	}

	async processImage(file: File, options: ImageProcessingOptions = {}): Promise<ProcessedImage> {
		await this.initialize();

		// Merge options with defaults
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

		const imageData = await this.fileToImageData(file);
		const originalWidth = imageData.width;
		const originalHeight = imageData.height;
		const aspectRatio = originalWidth / originalHeight;

		const variants: ImageVariant[] = [];

		// Generate variants for each width and format combination
		for (const width of opts.widths) {
			// Skip if requested width is larger than original
			if (width > originalWidth) continue;

			const height = Math.round(width / aspectRatio);

			// Resize the image for this width
			const resizedImageData = await resize(imageData, {
				width,
				height,
				method: 'lanczos3'
			});

			for (const format of opts.formats) {
				try {
					const src = await this.generateVariant(resizedImageData, format, opts);
					
					// Get the quality value for this format
					const formatQuality = opts.formatOptions[format as keyof FormatSpecificOptions]?.quality ?? opts.quality;
					
					variants.push({
						src,
						width,
						height,
						format,
						quality: formatQuality
					});
				} catch (error) {
					console.warn(`Failed to generate ${format} variant at ${width}px:`, error);
				}
			}
		}

		// Generate fallback (JPEG at medium size)
		let fallback = '';
		if (opts.generateFallback) {
			try {
				const fallbackWidth = Math.min(
					originalWidth,
					opts.widths[Math.floor(opts.widths.length / 2)]
				);
				const fallbackHeight = Math.round(fallbackWidth / aspectRatio);

				const fallbackImageData = await resize(imageData, {
					width: fallbackWidth,
					height: fallbackHeight,
					method: 'lanczos3'
				});

				fallback = await this.generateVariant(fallbackImageData, 'jpeg', opts);
			} catch (error) {
				console.warn('Failed to generate fallback:', error);
				fallback = URL.createObjectURL(file);
			}
		}

		return {
			variants,
			fallback,
			aspectRatio,
			originalWidth,
			originalHeight
		};
	}

	private async fileToImageData(file: File): Promise<ImageData> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				try {
					const canvas = new OffscreenCanvas(img.naturalWidth, img.naturalHeight);
					const ctx = canvas.getContext('2d');
					if (!ctx) {
						reject(new Error('Could not get 2D context'));
						return;
					}

					ctx.drawImage(img, 0, 0);
					const imageData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
					resolve(imageData);
				} catch (error) {
					reject(error);
				} finally {
					URL.revokeObjectURL(img.src);
				}
			};
			img.onerror = () => {
				URL.revokeObjectURL(img.src);
				reject(new Error('Failed to load image'));
			};
			img.src = URL.createObjectURL(file);
		});
	}

	private getMimeType(format: string): string {
		switch (format) {
			case 'webp':
				return 'image/webp';
			case 'avif':
				return 'image/avif';
			case 'png':
				return 'image/png';
			case 'jpeg':
			default:
				return 'image/jpeg';
		}
	}

	dispose(): void {
		this.initialized = false;
	}
}

// Singleton instance for better performance
let processorInstance: ImageProcessor | null = null;

export async function processImageFile(
	file: File,
	options?: ImageProcessingOptions
): Promise<ProcessedImage> {
	if (!processorInstance) {
		processorInstance = new ImageProcessor();
	}

	return await processorInstance.processImage(file, options);
}

// Cleanup function for when component unmounts
export function cleanupImageProcessor(): void {
	if (processorInstance) {
		processorInstance.dispose();
		processorInstance = null;
	}
}
