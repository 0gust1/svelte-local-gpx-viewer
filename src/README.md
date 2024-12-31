## Documentation

This lib exposes

**Svelte Components:**

- load GPX/GeoJson routes files (**local first, persisted in browser's indexedDB**)
- list the loaded routes (and hide/show, delete them)
- display the routes on a map (using svelte-maplibre)

**Lib:**

- a Dexie database wrapper with a table for the routes
- a store (Dexie's liveQuery) exposing reactive data for the routes
- a TS type for the routes

See the demo above for a quick overview.

This can be handy for hikers, bikepackers, travellers, outdoor enthusiasts or if you want to build an app for these users.

### Components and Dataflow

<img alt="dataflow of the components" src="dataflow.excalidraw.svg">

### Installation

Npm install the package

```bash
# via npm registry
npm install svelte-local-gpx-viewer

# via github repo (no build artifacts, you'll have to build the lib yourself)
npm install 0gust1/svelte-local-gpx-viewer
```

### Usage with Svelte/Sveltekit

All the components:

```html
<script lang="ts">
	import { GpxLoad, LocalRoutesList, MapLibreWrapper } from 'svelte-local-gpx-viewer';
</script>

<div>
	<div>
		<GpxLoad />
	</div>
	<div>
		<LocalRoutesList />
	</div>
</div>

<div>
	<MapLibreWrapper />
</div>
```

If you don't want to use the MapLibreWrapper component, you can use the store exposed by the lib to get the routes and display them on your own map component.

```html
<script lang="ts">
	// import the store, it will be populated with the routes
	import { liveGeoJSONRoutes } from 'svelte-local-gpx-viewer';
</script>

<!-- Use the store in your app -->
<ul>
	{#each ($liveGeoJSONRoutes || []) as route (route.id)}
	<li>
		<p>{route.name}</p>
		<details>
			<summary>Route GeoJSON</summary>
			<pre>{JSON.stringify(route.data, null, 2)}</pre>
		</details>
	</li>
	{/each}
</ul>
```

### Usage with Vanilla JS

TODO: test case to write and document
