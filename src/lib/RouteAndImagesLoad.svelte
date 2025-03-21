<script lang="ts">
	import type { FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
	import { prepareRoutesFromFiles } from './route_utils.js';
	let route_file: FileList | null = $state(null);
	let image_files: FileList | null = $state(null);
	let route: FeatureCollection<Geometry, GeoJsonProperties> | null = $derived.by(async ()=>{
		let geojson = null; 
		if(route_file) {
			geojson = await prepareRoutesFromFiles(route_file); 
			return geojson;
		}else{
			return  null
		}
	});

	function handleDropRoute(event: DragEvent) {
		route_file = event.dataTransfer?.files ?? null;
		event.preventDefault();
	}
	function handleDropImages(event: DragEvent) {
		image_files = event.dataTransfer?.files ?? null;
		event.preventDefault();
	}
	function handleDragover(event: DragEvent) {
		event.preventDefault();
	}

	function saveInDB() {
		console.log('saveInDB', route_file, image_files);
	}

	let inputRouteElmt: HTMLInputElement;
	let inputImagesElmt: HTMLInputElement;

	$effect( () => {
		if (!route_file) {
			inputRouteElmt.value = inputRouteElmt.defaultValue;
		}else{
			geojson = await prepareRoutesFromFiles(route_file);
		}
		if (!image_files) {
			inputImagesElmt.value = inputImagesElmt.defaultValue;
		}else{}
	});
</script>

<fieldset class="flex flex-row gap-3">
	<label for="route_file" class="drop-zone" ondrop={handleDropRoute} ondragover={handleDragover}>
		<span class="drop-zone_text">Drop your GPX or Geojson route file here</span>
		or
		<input
			id="route_file"
			bind:this={inputRouteElmt}
			type="file"
			onchange={(event) => {
				route_file = event.target.files;
				console.log('route_file', event.target.files);
			}}
			accept=".gpx, .geojson, .json"
			class=""
		/>
		<p class="text-xs text-slate-500">(Data will stay on your computer)</p>
	</label>

	<label for="image_files" class="drop-zone" ondrop={handleDropImages} ondragover={handleDragover}>
		<span class="drop-zone_text">Drop your route pictures here</span>
		or
		<input
			id="image_files"
			disabled={route_file === null}
			bind:this={inputImagesElmt}
			type="file"
			onchange={(event) => {
				image_files = event.target.files;
				console.log('image_files', event.target.files);
			}}
			multiple
			accept="image/*"
			class=""
		/>
		<p class="text-xs text-slate-500">(Data will stay on your computer)</p>
	</label>
</fieldset>

<style lang="postcss">
	.drop-zone {
		@apply rounded-lg border-2 border-dashed bg-transparent;
		@apply h-32;
		@apply flex flex-col items-center justify-center;
		@apply text-center text-slate-500;
	}
	.drop-zone:hover {
		@apply border-slate-300 bg-slate-100;
	}
	.drop-zone input[type='file'] {
		@apply w-11/12 max-w-full bg-slate-200 p-3 text-xs text-slate-500;
	}
	.drop-zone .drop-zone_text {
		@apply px-2 text-lg font-semibold sm:text-base;
	}
	input:disabled {
		@apply cursor-not-allowed opacity-50;
	}
</style>
