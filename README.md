# Svelte-local-gpx-viewer

A small collection of Svelte components to load GPX files (local first, persisted in browser's indexedDB) and display them.

local-first database is powered by Dexie.

gpx route display is powered by maplibre (and the svelte-maplibre wrapper).

## Using the components in a Svelte/Sveltekit project

TODO

## Using the components in pure JS

TODO

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Everything inside `src/lib` is part of your library, everything inside `src/routes` can be used as a showcase or preview app.

## Building

To build the library:

```bash
npm run package
```

To create a production version of the showcase app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

### Vanilla JS

To create a vanilla JS version of the library:

```bash
npm run build:vanilla
```

This will create a `dist-js` folder with the compiled library.

- [] add an HTML file to the `dist-js` folder to test the integration of the library in a vanilla JS project.
- [] add a `README.md` file to the `dist-js` folder to explain how to use the library in a vanilla JS project.

refs:  
- https://stackoverflow.com/questions/75832641/how-to-compile-svelte-3-components-into-iifes-that-can-be-used-in-vanilla-js/75895650#75895650
- https://svelte.dev/docs/svelte/imperative-component-api

## Publishing

Go into the `package.json` and give your package the desired name through the `"name"` option. Also consider adding a `"license"` field and point it to a `LICENSE` file which you can create from a template (one popular option is the [MIT license](https://opensource.org/license/mit/)).

To publish your library to [npm](https://www.npmjs.com):

```bash
npm publish
```
