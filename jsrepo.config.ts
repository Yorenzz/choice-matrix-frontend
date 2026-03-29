import { defineConfig } from 'jsrepo';

export default defineConfig({
    // configure where stuff comes from here
    registries: [],
    // configure where stuff goes here
    paths: {
        '*': './src/components/bits',
        component: './src/components/bits',
        hook: './src/composables/bits',
        lib: './src/lib',
    },
});
