## Documentation

This lib exposes a few components to load GPX routes files (local first, persisted in browser's indexedDB) and display them.

<img src="dataflow.excalidraw.svg">

### Usage

#### Installation

Npm install the package, via the github repository (package is not published on npm yet).

TODO: install from github won't give build artifacts, so the user will have to build the lib themselves.

```bash
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

