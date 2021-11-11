import {join} from 'path';
import {defineConfig} from 'vite';

const src_root_dir = join(__dirname, 'src');
const dist_root_dir = join(__dirname, 'dist');

// https://vitejs.dev/config/
export default defineConfig({
    root: src_root_dir,
    resolve: {
        alias: {
            '@': src_root_dir,
        },
    },
    base: './',
    build: {
        outDir: dist_root_dir,
        minify: true,
        sourcemap: false,
        brotliSize: true,
        emptyOutDir: true,
        lib: {
            entry: join(src_root_dir, 'main.ts'),
            formats: ['umd', 'es'],
            name: 'jsutils',
        },
    },
    server: {
        port: 3021,
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
    plugins: [],
});
