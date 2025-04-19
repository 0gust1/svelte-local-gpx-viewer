<script lang="ts">
	import ExifReader from 'exifreader';
  import ObjectDisplay from './ObjectDisplay.svelte';
	let files = $state<FileList | null>(null);

	let imagesData = $derived.by(async () => {
		if (!files) return [];
		const imagesData = [];
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const tags = await ExifReader.load(file, {expanded: true});
			imagesData.push({
				url: URL.createObjectURL(file),
				tags: tags
			});
		}
		return imagesData;
	});
</script>

<input type="file" id="fileInput" accept="image/*" multiple bind:files />
<p class="text-xs">Click to add photos</p>

<div>
	{#if files}
		{#each Array.from(files) as file}
			<p>{file.name}</p>
		{/each}

		{#await imagesData}
			<p>Loading...</p>
		{:then imgsData}
			{#if imgsData.length > 0}
				{#each imgsData as imgData}
        <div class="flex gap-1">
					<img src={imgData.url} alt="Uploaded pic" style="max-width: 200px; max-height: 200px;" />
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
	{/if}
</div>
