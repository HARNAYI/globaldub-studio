import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/** Solana / spl-token expect Node's global Buffer; inject before app code runs. */
function injectBufferPolyfill(): Plugin {
  const mainPath = path.resolve(__dirname, "src/main.tsx");
  return {
    name: "inject-buffer-polyfill",
    enforce: "pre",
    transform(code, id) {
      const cleanId = id.split("?")[0];
      if (path.normalize(cleanId) === path.normalize(mainPath)) {
        return `import { Buffer as __Buffer } from "buffer";\nglobalThis.Buffer = __Buffer;\n${code}`;
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    global: "globalThis",
  },
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [injectBufferPolyfill(), react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  optimizeDeps: {
    include: ["buffer"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
}));
