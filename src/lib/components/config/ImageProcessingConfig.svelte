<script lang="ts">
	import type { ImageProcessingOptions, FormatSpecificOptions } from '$lib/db_data/config.datatypes';

	interface Props {
		value: ImageProcessingOptions;
		onchange: (value: ImageProcessingOptions) => void;
	}

	let { value, onchange }: Props = $props();

	function updateValue(updates: Partial<ImageProcessingOptions>) {
		const newValue = { ...value, ...updates };
		onchange(newValue);
	}

	function updateFormatOptions(format: keyof FormatSpecificOptions, options: any) {
		const newFormatOptions = {
			...value.formatOptions,
			[format]: {
				...value.formatOptions?.[format],
				...options
			}
		};
		updateValue({ formatOptions: newFormatOptions });
	}

	function updateWidths(widthsStr: string) {
		try {
			const widths = widthsStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
			updateValue({ widths });
		} catch (e) {
			console.warn('Invalid widths format:', e);
		}
	}

	function updateFormats(formatsStr: string) {
		try {
			const formats = formatsStr.split(',').map(s => s.trim()).filter(f => ['webp', 'avif', 'jpeg'].includes(f)) as ('webp' | 'avif' | 'jpeg')[];
			updateValue({ formats });
		} catch (e) {
			console.warn('Invalid formats:', e);
		}
	}
</script>

<div class="space-y-4">
	<h3 class="text-lg font-semibold">Image Processing Options</h3>
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
		<label class="block">
			<span class="text-sm font-medium">Widths (comma-separated):</span>
			<input
				type="text"
				value={value.widths?.join(', ') || ''}
				oninput={(e) => updateWidths(e.currentTarget.value)}
				placeholder="400, 800, 1200, 1600"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
			/>
		</label>

		<label class="block">
			<span class="text-sm font-medium">Formats (comma-separated):</span>
			<input
				type="text"
				value={value.formats?.join(', ') || ''}
				oninput={(e) => updateFormats(e.currentTarget.value)}
				placeholder="avif, webp, jpeg"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
			/>
		</label>

		<label class="block">
			<span class="text-sm font-medium">Quality (0-100):</span>
			<input
				type="number"
				min="0"
				max="100"
				value={value.quality || 80}
				oninput={(e) => updateValue({ quality: parseInt(e.currentTarget.value) })}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
			/>
		</label>

		<label class="block">
			<span class="text-sm font-medium">Effort (0-10):</span>
			<input
				type="number"
				min="0"
				max="10"
				value={value.effort || 4}
				oninput={(e) => updateValue({ effort: parseInt(e.currentTarget.value) })}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
			/>
		</label>
	</div>

	<div class="flex gap-4">
		<label class="flex items-center">
			<input
				type="checkbox"
				checked={value.generateFallback ?? true}
				onchange={(e) => updateValue({ generateFallback: e.currentTarget.checked })}
				class="mr-2"
			/>
			<span class="text-sm">Generate Fallback</span>
		</label>

		<label class="flex items-center">
			<input
				type="checkbox"
				checked={value.progressive ?? true}
				onchange={(e) => updateValue({ progressive: e.currentTarget.checked })}
				class="mr-2"
			/>
			<span class="text-sm">Progressive</span>
		</label>
	</div>

	<!-- JPEG Options -->
	<div class="border border-gray-200 rounded-lg p-4">
		<h4 class="text-md font-medium mb-3">JPEG Options</h4>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<label class="block">
				<span class="text-sm">Quality:</span>
				<input
					type="number"
					min="0"
					max="100"
					value={value.formatOptions?.jpeg?.quality || 75}
					oninput={(e) => updateFormatOptions('jpeg', { quality: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm">Smoothing:</span>
				<input
					type="number"
					min="0"
					max="100"
					value={value.formatOptions?.jpeg?.smoothing || 0}
					oninput={(e) => updateFormatOptions('jpeg', { smoothing: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm">Color Space:</span>
				<select
					value={value.formatOptions?.jpeg?.color_space || 3}
					onchange={(e) => updateFormatOptions('jpeg', { color_space: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				>
					<option value={1}>GRAYSCALE</option>
					<option value={2}>RGB</option>
					<option value={3}>YCbCr</option>
				</select>
			</label>

			<label class="flex items-center">
				<input
					type="checkbox"
					checked={value.formatOptions?.jpeg?.baseline ?? false}
					onchange={(e) => updateFormatOptions('jpeg', { baseline: e.currentTarget.checked })}
					class="mr-2"
				/>
				<span class="text-sm">Baseline</span>
			</label>

			<label class="flex items-center">
				<input
					type="checkbox"
					checked={value.formatOptions?.jpeg?.progressive ?? true}
					onchange={(e) => updateFormatOptions('jpeg', { progressive: e.currentTarget.checked })}
					class="mr-2"
				/>
				<span class="text-sm">Progressive</span>
			</label>

			<label class="flex items-center">
				<input
					type="checkbox"
					checked={value.formatOptions?.jpeg?.optimize_coding ?? true}
					onchange={(e) => updateFormatOptions('jpeg', { optimize_coding: e.currentTarget.checked })}
					class="mr-2"
				/>
				<span class="text-sm">Optimize Coding</span>
			</label>
		</div>
	</div>

	<!-- WebP Options -->
	<div class="border border-gray-200 rounded-lg p-4">
		<h4 class="text-md font-medium mb-3">WebP Options</h4>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<label class="block">
				<span class="text-sm">Quality:</span>
				<input
					type="number"
					min="0"
					max="100"
					value={value.formatOptions?.webp?.quality || 75}
					oninput={(e) => updateFormatOptions('webp', { quality: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm">Method (0-6):</span>
				<input
					type="number"
					min="0"
					max="6"
					value={value.formatOptions?.webp?.method || 4}
					oninput={(e) => updateFormatOptions('webp', { method: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm">SNS Strength:</span>
				<input
					type="number"
					min="0"
					max="100"
					value={value.formatOptions?.webp?.sns_strength || 50}
					oninput={(e) => updateFormatOptions('webp', { sns_strength: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm">Filter Strength:</span>
				<input
					type="number"
					min="0"
					max="100"
					value={value.formatOptions?.webp?.filter_strength || 60}
					oninput={(e) => updateFormatOptions('webp', { filter_strength: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm">Alpha Quality:</span>
				<input
					type="number"
					min="0"
					max="100"
					value={value.formatOptions?.webp?.alpha_quality || 100}
					oninput={(e) => updateFormatOptions('webp', { alpha_quality: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="flex items-center">
				<input
					type="checkbox"
					checked={value.formatOptions?.webp?.lossless === 1}
					onchange={(e) => updateFormatOptions('webp', { lossless: e.currentTarget.checked ? 1 : 0 })}
					class="mr-2"
				/>
				<span class="text-sm">Lossless</span>
			</label>
		</div>
	</div>

	<!-- AVIF Options -->
	<div class="border border-gray-200 rounded-lg p-4">
		<h4 class="text-md font-medium mb-3">AVIF Options</h4>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<label class="block">
				<span class="text-sm">Quality:</span>
				<input
					type="number"
					min="0"
					max="100"
					value={value.formatOptions?.avif?.quality || 50}
					oninput={(e) => updateFormatOptions('avif', { quality: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm">Speed (0-10):</span>
				<input
					type="number"
					min="0"
					max="10"
					value={value.formatOptions?.avif?.speed || 6}
					oninput={(e) => updateFormatOptions('avif', { speed: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				/>
			</label>

			<label class="block">
				<span class="text-sm">Bit Depth:</span>
				<select
					value={value.formatOptions?.avif?.bitDepth || 8}
					onchange={(e) => updateFormatOptions('avif', { bitDepth: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				>
					<option value={8}>8-bit</option>
					<option value={10}>10-bit</option>
					<option value={12}>12-bit</option>
				</select>
			</label>

			<label class="block">
				<span class="text-sm">Subsample:</span>
				<select
					value={value.formatOptions?.avif?.subsample || 1}
					onchange={(e) => updateFormatOptions('avif', { subsample: parseInt(e.currentTarget.value) })}
					class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
				>
					<option value={0}>4:4:4</option>
					<option value={1}>4:2:0</option>
					<option value={2}>4:2:2</option>
				</select>
			</label>

			<label class="flex items-center">
				<input
					type="checkbox"
					checked={value.formatOptions?.avif?.lossless ?? false}
					onchange={(e) => updateFormatOptions('avif', { lossless: e.currentTarget.checked })}
					class="mr-2"
				/>
				<span class="text-sm">Lossless</span>
			</label>

			<label class="flex items-center">
				<input
					type="checkbox"
					checked={value.formatOptions?.avif?.enableSharpYUV ?? false}
					onchange={(e) => updateFormatOptions('avif', { enableSharpYUV: e.currentTarget.checked })}
					class="mr-2"
				/>
				<span class="text-sm">Enable Sharp YUV</span>
			</label>
		</div>
	</div>
</div>
