import { type EncodeOptions as JPEGEncodeOptions } from '@jsquash/jpeg/meta';
import { type EncodeOptions as WebpEncodeOptions } from '@jsquash/webp/meta';
import { type EncodeOptions as AvifEncodeOptions } from '@jsquash/avif/meta';

export interface FormatSpecificOptions {
	// https://deepwiki.com/jamsinclair/jSquash/2.3-jpeg-codec
	jpeg?: Partial<JPEGEncodeOptions>;
	// https://deepwiki.com/jamsinclair/jSquash/2.4-webp-codec
	webp?: Partial<WebpEncodeOptions>;
	// https://deepwiki.com/jamsinclair/jSquash/2.2-avif-codec
	avif?: Partial<AvifEncodeOptions>;
}

export const DEFAULT_FORMAT_OPTIONS: Required<FormatSpecificOptions> = {
	jpeg: {
		quality: 80,
		progressive: true,
		optimize_coding: true,
		smoothing: 0,
		color_space: 3, // YCbCr
		quant_table: 3,
		auto_subsample: true,
		chroma_subsample: 2
	},
	webp: {
		quality: 65, // Lower quality for WebP as it's more efficient
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
		tileRowsLog2: 0,
		tileColsLog2: 0
	}
};

export const DEFAULT_IMAGE_PROCESSING_OPTIONS: Required<ImageProcessingOptions> = {
	widths: [400, 800, 1200, 1600],
	formats: ['avif', 'webp', 'jpeg'],
	quality: 80,
	generateFallback: true,
	progressive: true,
	effort: 4,
	formatOptions: DEFAULT_FORMAT_OPTIONS
};

export interface ImageProcessingOptions {
	widths?: number[];
	formats?: ('webp' | 'avif' | 'jpeg')[];
	quality?: number; // Global fallback quality
	generateFallback?: boolean;
	progressive?: boolean;
	effort?: number;
	formatOptions?: FormatSpecificOptions;
}

export interface AppConfiguration {
	// General application settings
  //...
  // Export options for routes
	exportOptions: ExportOptions;
}

export interface ExportOptions {
	staticFilesUrls: {
		filesUrlPrefix: string;
		filesUrlSuffix: string;
		imagesUrlPrefix: string;
		imagesUrlSuffix: string;
	};
	routeSimplification: {
		tolerance: number;
		highQuality: boolean;
	};
	imageProcessing: {
		enabled: boolean;
		includeOriginal: boolean;
		options: ImageProcessingOptions;
	};
}

export const defaultExportOptions: ExportOptions = {
	staticFilesUrls: {
		filesUrlPrefix: '',
		filesUrlSuffix: '',

		imagesUrlPrefix: '',
		imagesUrlSuffix: ''
	},
	routeSimplification: {
		tolerance: 0.00001,
		highQuality: true
	},
	imageProcessing: {
		enabled: true,
		includeOriginal: true,
		options: DEFAULT_IMAGE_PROCESSING_OPTIONS
	}
};
