<script lang="ts">
	let { data=$bindable(), hasChanges=$bindable(), field, children } = $props();
	let editMode = $state(false);
</script>

<div class="original">
	{#if editMode}
		<div class="flex flex-col">
			{#if field === 'name'}
				<input type="text" bind:value={data[field]} class="border px-1 py-2" />
			{:else if field === 'description'}
				<textarea bind:value={data[field]} class="border px-1 py-2"></textarea>
			{/if}
			<button
				type="button"
				class="ml-auto border px-1 py-2"
				onclick={() => {
					editMode = false;
          hasChanges = true;
					// row.save();
				}}>Save</button
			>
		</div>
	{:else}
		<div class="flex">
			{@render children()}
			<button
				type="button"
				class="ml-auto border px-1 py-2"
				onclick={() => {
					editMode = true;
				}}>Edit</button
			>
		</div>
	{/if}
</div>
