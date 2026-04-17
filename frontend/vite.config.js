import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [react()],
        define: {
            __SUPABASE_URL__: JSON.stringify(env.SUPABASE_URL || ""),
            __SUPABASE_KEY__: JSON.stringify(env.SUPABASE_KEY || ""),
            __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || env.API_BASE_URL || "/api"),
        },
        resolve: {
            alias: {
                "@": "/src",
            },
        },
        server: {
            port: 3000,
            proxy: {
                "/api": {
                    target: env.VITE_LOCAL_API_TARGET || "http://localhost:8000",
                    changeOrigin: true,
                },
            },
        },
    };
});
