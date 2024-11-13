## Documentation

This lib exposes a few svelte components to: 

- load GPX/GeoJson routes files (local first, persisted in browser's indexedDB)
- list the loaded routes (and hide/show, delete them)
- display the routes on a map (using svelte-maplibre)

See the demo above for a quick overview.

This can be handy for hikers, bikepackers, travellers, outdoor enthusiasts or if you want to build an app for these users.

### Components and Dataflow

<img src="dataflow.excalidraw.svg">

### Usage

#### Installation

Npm install the package

TODO: install from github won't give build artifacts, so the user will have to build the lib themselves.

```bash
# via npm registry
npm install svelte-local-gpx-viewer

# via github repo (no build artifacts, you'll have to build the lib yourself)
npm install 0gust1/svelte-local-gpx-viewer
```

#### Svelte/Sveltekit

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

#### Vanilla JS

TODO: test case to write and document

