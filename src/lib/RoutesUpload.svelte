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
	<div class="drop-zone_text"
		>
		<p>Drop here your <span class=" font-bold">routes/traces</span> files</p>
		<span class="text-xs">
			(<code>.gpx</code>, <code>.geojson</code> or <code>.fit</code>)
		</span>
	</div>
	or click below
	<input
		id="gpx_route_files"
		bind:this={inputElmt}
		type="file"
		bind:files
		multiple
		accept=".gpx, .geojson, .fit"
		class="my-1 rounded border border-slate-300 shadow-sm focus:border-slate-300 focus:ring-0"
	/>
	<p class="text-xs text-slate-500">(Data will stay on your computer)</p>
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
	@reference "../app.css";
	.drop-zone {
		@apply rounded-lg border-2 border-dashed bg-transparent;
		/* @apply h-32; */
		@apply py-2;
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
</style>
