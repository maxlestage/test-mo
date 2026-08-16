import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Chemins relatifs : le même build est servi à la racine sur Heroku
// et chargé en file:// dans la WebView iOS (ios/).
export default defineConfig({
  base: "./",
  plugins: [vue()],
});
