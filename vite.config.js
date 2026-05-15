import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Déployé en tant que page de projet GitHub Pages :
// https://maxlestage.github.io/test-mo/  -> base = "/test-mo/"
export default defineConfig({
  base: "/test-mo/",
  plugins: [vue()],
});
