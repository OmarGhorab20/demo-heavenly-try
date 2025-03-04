import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import compression from 'vite-plugin-compression'
import { imagetools } from 'vite-imagetools'
import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig(({ mode }) => ({
  base: "/",
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),  
    compression({ algorithm: 'brotliCompress', ext: '.br' }), 
    imagetools(), // Optimize images dynamically
    mode === "development" ? visualizer({ open: true }) : null 
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: "https://demo-heavenly-try.vercel.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },  
  build: {
    minify: "esbuild", // Keep esbuild for faster builds
    target: "esnext",
    outDir: "dist",
    sourcemap: true, // Enable source maps
    chunkSizeWarningLimit: 500, // Increase the limit to reduce warnings
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ["console.info", "console.debug", "console.warn"], // Remove specific logs
      },
      output: {
        comments: false, // Remove comments
      },
    },
  },
  
}));
