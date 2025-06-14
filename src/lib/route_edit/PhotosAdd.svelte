<script lang="ts">
	import ExifReader from 'exifreader';
	import { point } from '@turf/turf';
	import { type PhotoGeoPoint, type RoutePhotos } from '$lib/db_data/routes.datatypes';
	import ObjectDisplay from '$lib/ObjectDisplay.svelte';


	let {
		photosToEdit = $bindable(),
		photoSelection = $bindable(),
		isPhotoWithinRouteBounds,
		isPhotoNearRoute
	}: {
		photosToEdit: RoutePhotos;
		photoSelection: { hovered: number | null; selected: number | null };
		isPhotoWithinRouteBounds: (lng: number, lat: number, tolerance?: number) => boolean;
		isPhotoNearRoute: (lng: number, lat: number, maxDistance?: number) => boolean;
	} = $props();
	
	let imagesListMode = $state(true);
	let files = $state<FileList | null>(null);

	let imagesData = $derived.by(async () => {
		if (!files) return [];
		const imagesData = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const tags = await ExifReader.load(file, { expanded: true });
			imagesData.push({
				url: URL.createObjectURL(file),
				tags: tags,
				file: file
			});
		}
		return imagesData;
	});

	let addingPhotos = $derived.by(async () => {
    const imgsData = await imagesData;
    if (imgsData && imgsData.length > 0) {
        const updatedFeatures = imgsData
            .map((imgData) => {
                const lng = imgData.tags?.gps?.Longitude || 0;
                const lat = imgData.tags?.gps?.Latitude || 0;
                
                // Check if coordinates are missing (both 0 or no GPS data)
                const hasCoordinates = imgData.tags?.gps && (lng !== 0 || lat !== 0);
                
                // Validate photo location using Turf.js-based functions only if coordinates exist
                const isValidLocation = hasCoordinates ? isPhotoWithinRouteBounds(lng, lat) : false;
                const isNearRoute = hasCoordinates ? isPhotoNearRoute(lng, lat) : false;
                
                return {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    properties: {
                        type: 'Photo',
                        title: imgData.tags?.title?.description || 'Untitled',
                        filename: imgData.file.name,
                        extension: imgData.file.name.split('.').pop() || '',
                        binaryContent: imgData.file,
                        // Add validation flags
                        hasCoordinates,
                        isValidLocation,
                        isNearRoute
                    }
                };
            })
            .sort((a, b) => {
                const aDate = a.properties.binaryContent.lastModified;
                const bDate = b.properties.binaryContent.lastModified;
                return aDate - bDate;
            });
			  
        photosToEdit = {
            ...photosToEdit,
            features: [...(photosToEdit.features || []), ...updatedFeatures]
        };
				
				if(photosToEdit.features.length >=10){
					imagesListMode = false;
			  }
    }
    return true;
});

// Helper function to get visual classes based on photo validation
function getPhotoStatusClasses(feature: PhotoGeoPoint): string {
    const { hasCoordinates, isValidLocation, isNearRoute } = feature.properties;
    
    if (!hasCoordinates) {
        return 'ring-2 ring-gray-500 opacity-50';
    } else if (!isValidLocation && !isNearRoute) {
        return 'ring-2 ring-red-500 opacity-60';
    } else if (!isValidLocation || !isNearRoute) {
        return 'ring-2 ring-yellow-500 opacity-75';
    }
    return '';
}

// Helper function to get status text
function getPhotoStatusText(feature: PhotoGeoPoint): string {
    const { hasCoordinates, isValidLocation, isNearRoute } = feature.properties;
    
    if (!hasCoordinates) {
        return 'No GPS coordinates';
    } else if (!isValidLocation && !isNearRoute) {
        return 'Far from route';
    } else if (!isValidLocation) {
        return 'Outside bounding box';
    } else if (!isNearRoute) {
        return 'Far from route path';
    }
    return '';
}

	function deletePhoto(index: number) {
		photosToEdit.features.splice(index, 1);
	}
</script>

<p class="text-xs">Click to add photos</p>
<input
	class="mb-2 border bg-slate-200 p-1"
	type="file"
	id="fileInput"
	accept=".jpg,.jpeg"
	multiple
	bind:files
/>

<div>
	{#await addingPhotos}
		<p>Loading...</p>
	{:then editedPhotos}
		{#if photosToEdit.features.length > 0}
            <div class="mb-2 flex items-center gap-2">
                <span class="text-sm font-medium">View:</span>
                <label class="flex items-center gap-1 cursor-pointer">
                    <input
                        type="checkbox"
                        bind:checked={imagesListMode}
                        class="sr-only"
                    />
                    <div class="flex bg-gray-200 rounded-md p-1">
                        <span class="px-2 py-1 text-xs rounded transition-colors {imagesListMode ? 'bg-blue-500 text-white' : 'text-gray-600'}">
                            List
                        </span>
                        <span class="px-2 py-1 text-xs rounded transition-colors {!imagesListMode ? 'bg-blue-500 text-white' : 'text-gray-600'}">
                            Grid
                        </span>
                    </div>
                </label>
            </div>
			
		{/if}
		
		{#if imagesListMode}
			<div class="flex flex-wrap gap-1">
				{#each photosToEdit.features as feature, i}
					{@render imageWithFields(feature, i)}
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-4 gap-1">
				{#each photosToEdit.features as feature, i}
					{@render image(feature, i)}
				{/each}
			</div>
		{/if}
	{:catch error}
		<p class="text-red-500">Error: {error.message}</p>
	{/await}
</div>

{#snippet imageWithFields(feature: PhotoGeoPoint, i: number)}
	<div class="flex gap-1 {getPhotoStatusClasses(feature)}">
		<div class="relative">
			<img
				src={URL.createObjectURL(feature.properties.binaryContent)}
				alt="Uploaded pic"
				style="max-width: 200px; max-height: 200px;"
				onmouseenter={() => {
					photoSelection.hovered = i;
				}}
				onmouseleave={() => {
					photoSelection.hovered = null;
				}}
			/>
			{#if getPhotoStatusText(feature)}
				<div class="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded" title="{getPhotoStatusText(feature)}">
					⚠️ {getPhotoStatusText(feature)}
				</div>
			{/if}
			<button
					type="button"
					onclick={() => {
						deletePhoto(i);
					}}
					class="absolute top-0 right-0 rounded-bl-md border border-slate-200 bg-slate-200 p-0.5 text-xs opacity-70 hover:opacity-100 z-10"
				>
					❌
				</button>
		</div>
		<div>
			<div class="flex items-center gap-2">
				<span>{feature.properties.filename}</span>
				
			</div>

			{#if getPhotoStatusText(feature)}
				<div class="text-xs text-orange-600 mb-2" title="{getPhotoStatusText(feature)}">
					⚠️ {getPhotoStatusText(feature)}
				</div>
			{/if}

			<div class="space-y-1">
				<input
					class="text-xs w-full p-1 border rounded"
					type="text"
					bind:value={feature.properties.title}
					placeholder="Title"
				/>
				<input
					class="text-xs w-full p-1 border rounded"
					type="text"
					bind:value={feature.properties.textContent}
					placeholder="Description"
				/>
				<input
					class="text-xs w-full p-1 border rounded"
					type="text"
					bind:value={feature.properties.alternativeText}
					placeholder="Alternative text"
				/>
			</div>
		</div>
	</div>
{/snippet}

{#snippet image(feature: PhotoGeoPoint, i: number)}
	<div
		class="relative hover:outline hover:outline-2 hover:outline-orange-500 {photoSelection.selected === i ? 'outline outline-2 outline-blue-500' : ''} {getPhotoStatusClasses(feature)}"
		onmouseenter={() => {
			photoSelection.hovered = i;
		}}
		onmouseleave={() => {
			photoSelection.hovered = null;
		}}
	>
		<button
			class="absolute top-0 right-0 rounded-bl-md border border-slate-200 bg-slate-200 p-0.5 text-xs opacity-70 hover:opacity-100 z-10"
			type="button"
			onclick={() => {
				deletePhoto(i);
			}}
		>
			❌
		</button>
		
		{#if getPhotoStatusText(feature)}
			<div class="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded z-10" title="{getPhotoStatusText(feature)}">
				⚠️
			</div>
		{/if}
		
		<img
			src={URL.createObjectURL(feature.properties.binaryContent)}
			alt="Uploaded pic"
			onclick={() => {
				if (photoSelection.selected === i) {
					photoSelection.selected = null;
				} else {
					photoSelection.selected = i;
				}
				photoSelection.hovered = null;
			}}
		/>
		
		<div class="flex w-full justify-between gap-1 bg-slate-50 bg-slate-200 p-1 text-xs">
			<span class="break-all">{feature.properties.filename}</span>
			{#if getPhotoStatusText(feature)}
				<span class="text-orange-600 font-semibold" title="{getPhotoStatusText(feature)}">⚠️</span>
			{/if}
		</div>
	</div>
{/snippet}
