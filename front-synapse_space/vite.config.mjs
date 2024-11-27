import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    type: "module",
    base: '/',
    plugins: [react()],
    server: {
        open: true,
        port: 3000,
        host: true,
    },
    build: {
        outDir: 'build',
    },
});
