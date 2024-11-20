//https://stackoverflow.com/questions/75832641/how-to-compile-svelte-3-components-into-iifes-that-can-be-used-in-vanilla-js

import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'dist/index.js'),
            name: 'LocalGPXViewer',
            fileName: 'local-gpx-viewer',
        },
        outDir: 'dist-js',
    },
    plugins: [
        svelte(),
    ],
});