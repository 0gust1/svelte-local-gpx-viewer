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
		quality: 75,
    baseline: false,
    arithmetic: false,
    progressive: true,
    optimize_coding: true,
    smoothing: 0,
    color_space: 3 /* MozJpegColorSpace.YCbCr */,
    quant_table: 3,
    trellis_multipass: false,
    trellis_opt_zero: false,
    trellis_opt_table: false,
    trellis_loops: 1,
    auto_subsample: true,
    chroma_subsample: 2,
    separate_chroma_quality: false,
    chroma_quality: 75,
	},
	webp: {
    quality: 75,
    target_size: 0,
    target_PSNR: 0,
    method: 4,
    sns_strength: 50,
    filter_strength: 60,
    filter_sharpness: 0,
    filter_type: 1,
    partitions: 0,
    segments: 4,
    pass: 1,
    show_compressed: 0,
    preprocessing: 0,
    autofilter: 0,
    partition_limit: 0,
    alpha_compression: 1,
    alpha_filtering: 1,
    alpha_quality: 100,
    lossless: 0,
    exact: 0,
    image_hint: 0,
    emulate_jpeg_size: 0,
    thread_level: 0,
    low_memory: 0,
    near_lossless: 100,
    use_delta_palette: 0,
    use_sharp_yuv: 0,
	},
	avif: {
    quality: 50,
    qualityAlpha: -1,
    denoiseLevel: 0,
    tileColsLog2: 0,
    tileRowsLog2: 0,
    speed: 6,
    subsample: 1,
    chromaDeltaQ: false,
    sharpness: 0,
    tune: 0 /* AVIFTune.auto */,
    enableSharpYUV: false,
    bitDepth: 8,
    lossless: false,
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
