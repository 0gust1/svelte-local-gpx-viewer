<script lang="ts">
	let { files = $bindable(null), ...props }: { files: FileList | null } = $props();

	function handleDrop(event: DragEvent) {
		files = event.dataTransfer?.files ?? null;
		console.log('files', files);
		//loop through the files and add their text to the store
	}
	function handleDragover(event: DragEvent) {
		event.preventDefault();
	}
</script>

<div class="drop-zone" role="button" tabindex="0" ondrop={handleDrop} ondragover={handleDragover}>
	<input type="file" bind:files multiple accept=".gpx" />
</div>

{#if files}
	<div>Files:</div>
	{#each Array.from(files) as file}
		<details>
			<summary>{file.name}</summary>
			{#await file.text()}
				loading...
			{:then text}
				<pre>
{text}
</pre>
			{:catch error}
				{error.message} {error.stack}
			{/await}
		</details>
	{/each}
{/if}

<style lang="postcss">
	button {
		@apply border bg-slate-200 px-1;
	}
	.drop-zone {
		@apply border-2 border-dashed;
		height: 200px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
