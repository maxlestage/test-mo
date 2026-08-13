import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "./style.css";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");

// PWA : rend l'app installable et utilisable hors ligne.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* hors ligne ou contexte non sécurisé : l'app fonctionne sans */
    });
  });
}
