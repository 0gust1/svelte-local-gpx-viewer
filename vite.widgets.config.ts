import { svelte } from '@sveltejs/vite-plugin-svelte'


 
export default {
    build: {
        lib: {
            entry: 'src/lib/widgets/Route.svelte',
            name: 'MyComponent',
            fileName: (format) => `my-component.${format}.js`,
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
        sourcemap: 'inline',
    },
    plugins: [
        svelte({
            compilerOptions: {
                customElement: true,
            },
        }),
    ],
}