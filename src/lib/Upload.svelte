<script lang="ts">
	let { files = $bindable(null), ...props }: { files: FileList | null } = $props();
	let inputElmt: HTMLInputElement;
	function handleDrop(event: DragEvent) {
		files = event.dataTransfer?.files ?? null;
		event.preventDefault();
	}
	function handleDragover(event: DragEvent) {
		event.preventDefault();
	}
	$effect(() => {
		if (!files) {
			inputElmt.value = inputElmt.defaultValue;
		}
	});
</script>

<label for="gpx_route_files" class="drop-zone" ondrop={handleDrop} ondragover={handleDragover}>
	<span class="drop-zone_text">Drop your GPX files here</span>
	or
	<input id="gpx_route_files" bind:this={inputElmt} type="file" bind:files multiple accept=".gpx"
	class="flex flex-wrap" />
</label>

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
		@apply border-2 border-dashed rounded-lg bg-transparent;
		@apply h-32;
		@apply flex flex-col justify-center items-center;
	}
	.drop-zone:hover {
		@apply border-slate-300 bg-slate-100;
	}
	.drop-zone input[type=file]{
		@apply max-w-full w-11/12 bg-slate-200 p-3 text-slate-500;	
		}
		.drop-zone .drop-zone_text {
		@apply text-lg font-semibold;
		}
</style>
