import { svelte } from '@sveltejs/vite-plugin-svelte'
import { resolve } from 'path'

const widgets = [
    "src/lib/widgets/SimpleRoute.svelte",
    "src/lib/widgets/Route.svelte"
]
 
export default {
    resolve: {
        alias: {
            $lib: resolve('./src/lib'),
        },
    },
    build: {
        lib: {
            entry: widgets,
            fileName: (format, entryName) => `${entryName}.${format}.js`,
            formats: ['es'],
        },
        rollupOptions: {
            external: ['svelte'],
            output: {
                globals: {
                    svelte: 'svelte',
                },
            },
        },
        sourcemap: true,
    },
    plugins: [
        svelte({
            compilerOptions: {
                customElement: true,
            },
        }),
    ],
}