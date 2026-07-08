import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Déployé sur Heroku à la racine du domaine -> base = "/".
export default defineConfig({
  base: "/",
  plugins: [vue()],
});
