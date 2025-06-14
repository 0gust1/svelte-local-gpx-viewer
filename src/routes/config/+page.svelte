<script lang="ts">
	import type { PageProps } from './$types';
	let {data}:PageProps = $props();
	const { config, defaultExportOptions } = data;
</script>

<svelte:head>
	<title>Configuration - Svelte Local GPX Viewer</title>
</svelte:head>

<h1>App Settings</h1>
<h2>Config</h2>
<pre>
	<code>
		{JSON.stringify(config, null, 2)}
	</code>
</pre>
<h2>Default Export Options</h2>
<pre>
	<code>
		{JSON.stringify(defaultExportOptions, null, 2)}
	</code>
</pre>