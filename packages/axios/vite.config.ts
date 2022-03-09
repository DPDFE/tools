import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig({
    base: './',

    server: {
        proxy: {
            port: '3000',
            // 选项写法
            '/api': {
                target: 'http://localhost:3001/',
                changeOrigin: true,
                /**
                 * -
                 *
                 * @param path -
                 * @returns
                 */
                rewrite: (path) => {
                    console.log(path, 'path');
                    return path.replace(/^\/api/, '');
                },
            },
        },
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'axios',
            formats: ['es'],
        },
    },
});
