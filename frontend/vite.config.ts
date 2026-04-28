/// <reference types="vitest/config" />
/// <reference types="vite/client" />

import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@components": path.join(__dirname, "src/components/"),
            "@constants": path.join(__dirname, "src/constants/"),
            "@hooks": path.join(__dirname, "src/hooks/"),
            "@models": path.join(__dirname, "src/models/"),
            "@pages": path.join(__dirname, "src/pages/"),
            "@queries": path.join(__dirname, "src/queries/"),
            "@providers": path.join(__dirname, "src/providers/"),
            "@utils": path.join(__dirname, "src/utils/"),
        }
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/setupTests.ts",
        css: true,
    },
})