import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
const here = (path) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({ root: here("."), publicDir: here("../../public"), plugins: [react()], resolve: { alias: [
 { find: /^.*\/services\/(apiAuth|apiCabins|apiBookings|apiSettings)(?:\.js)?$/, replacement: here("./adapter.js") },
 { find: /^.*\/services\/supabase(?:\.js)?$/, replacement: here("./supabase.js") },
] }, server: { host: "127.0.0.1", port: 4183, strictPort: true } });
