# Svelte-local-gpx-viewer

A small collection of Svelte components to load GPX files (**local first, persisted in browser's indexedDB**) and display them.

- Local-first database is powered by [Dexie.js](https://dexie.org/).
- Route and map display is powered by [maplibre](https://maplibre.org/) (and the [svelte-maplibre wrapper library](https://github.com/dimfeld/svelte-maplibre)).
- Svelte v5

<picture>
  <img src="static/dataflow.excalidraw.svg">
</picture>

## Using the components in a Svelte/Sveltekit project

See Documentation website: [https://0gust1.github.io/svelte-local-gpx-viewer/](https://0gust1.github.io/svelte-local-gpx-viewer/)

## Using the components in pure JS

TODO

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` which id used for [the demo app](https://0gust1.github.io/svelte-local-gpx-viewer/).

## Building

To build and package the library (Svelte version):

```bash
npm run package
```

To create a production version of [the showcase app](https://0gust1.github.io/svelte-local-gpx-viewer/):

```bash
npm run build
```

You can them preview the showcase app build with `npm run preview`.

### Vanilla JS

To create a vanilla JS version of the library:

```bash
npm run build && npm run build:vanilla
```

This will create a `dist-js` folder with the compiled library.

- [] add an HTML file to the `dist-js` folder to test the integration of the library in a vanilla JS project.
- [] add a `README.md` file to the `dist-js` folder to explain how to use the library in a vanilla JS project.

refs:

- https://stackoverflow.com/questions/75832641/how-to-compile-svelte-3-components-into-iifes-that-can-be-used-in-vanilla-js/75895650#75895650
- https://svelte.dev/docs/svelte/imperative-component-api

## Publishing

To publish the library to [npm](https://www.npmjs.com):

```bash
npm publish
```
