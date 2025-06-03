<script lang="ts">
	import ExifReader from 'exifreader';
	import { type PhotoGeoPoint } from '$lib/routes.datatypes';
	import ObjectDisplay from '$lib/ObjectDisplay.svelte';
	import { type RoutePhotos } from '$lib/routes.datatypes';

	let {
		photosToEdit = $bindable(),
		photoSelection = $bindable()
	}: {
		photosToEdit: RoutePhotos;
		photoSelection: { hovered: number | null; selected: number | null };
	} = $props();
	let detailEditMode = $state(false);
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
				.map((imgData) => ({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [imgData.tags?.gps?.Longitude || 0, imgData.tags?.gps?.Latitude || 0]
					},
					properties: {
						type: 'Photo',
						title: imgData.tags?.title?.description || 'Untitled',
						filename: imgData.file.name,
						extension: imgData.file.name.split('.').pop() || '',
						binaryContent: imgData.file
					}
				}))
				.sort((a, b) => {
					const aDate = a.properties.binaryContent.lastModified;
					const bDate = b.properties.binaryContent.lastModified;
					return aDate - bDate;
				});

			photosToEdit = {
				...photosToEdit,
				features: [...(photosToEdit.features || []), ...updatedFeatures]
			};
		}
		return true;
	});

	function deletePhoto(index: number) {
		photosToEdit.features.splice(index, 1);
	}
</script>

<p class="text-xs">Click to add photos</p>
<input
	class="mb-2 border bg-slate-200 p-1"
	type="file"
	id="fileInput"
	accept="image/*"
	multiple
	bind:files
/>

<div>
	{#await addingPhotos}
		<p>Loading...</p>
	{:then editedPhotos}
		{#if photosToEdit.features.length > 0}
		<div>
			
				<input
					type="checkbox"
					name=""
					id="images-editmode"
					bind:checked={detailEditMode}
				/><label for="images-editmode" class="pl-1 inlline-block">Edit details</label
			>
		</div>
		{/if}
		{#if detailEditMode}
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

	<!-- {#if files}
		{#await imagesData}
			<p>Loading...</p>
		{:then imgsData}
			{#if imgsData.length > 0}
				{#each imgsData as imgData}
					<div class="flex gap-1">
						<img
							src={imgData.url}
							alt="Uploaded pic"
							style="max-width: 200px; max-height: 200px;"
						/>
						<div>
							<h3 class="text-sm font-bold">Exif Data</h3>
							<ObjectDisplay data={imgData.tags} />
						</div>
					</div>
				{/each}
			{/if}
		{:catch error}
			<p class="text-red-500">Error: {error.message}</p>
		{/await}
	{/if} -->
</div>

{#snippet imageWithFields(feature: PhotoGeoPoint, i: number)}
	<div class="flex gap-1">
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
		<div>
			<!-- <ObjectDisplay data={feature.properties} /> -->
			<div>
				{feature.properties.filename} ({feature.properties.extension})
				<button
					type="button"
					onclick={() => {
						deletePhoto(i);
					}}>❌</button
				>
			</div>

			<div>
				<input
					class="text-xs"
					type="text"
					bind:value={feature.properties.title}
					placeholder="Title"
				/>
				<input
					class="text-xs"
					type="text"
					bind:value={feature.properties.textContent}
					placeholder="Description"
				/>
				<input
					class="text-xs"
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
		class="relative hover:outline hover:outline-2 hover:outline-orange-500 {photoSelection.selected === i ? 'outline outline-2 outline-blue-500' : ''}"
		onmouseenter={() => {
			photoSelection.hovered = i;
		}}
		onmouseleave={() => {
			photoSelection.hovered = null;
		}}
	>
		<button
			class="absolute top-0 right-0 rounded-bl-md border border-slate-200 bg-slate-200 p-0.5 text-xs opacity-70 hover:opacity-100"
			type="button"
			onclick={() => {
				deletePhoto(i);
			}}>❌</button
		>
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
		</div>
	</div>
{/snippet}
