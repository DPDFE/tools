import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3002,
        proxy: {
            port: '3002',
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
});
