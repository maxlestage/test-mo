<script setup>
import View from "./components/View.vue";
import { useTheme } from "./composables/useTheme.js";
import logoUrl from "./assets/orange-logo.svg";

const { theme, toggle } = useTheme();
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="brand">
        <img :src="logoUrl" class="logo" alt="Orange" />
        <div>
          <h1>Mo-Grid</h1>
          <p>Atelier d'analyse linguistique de texte</p>
        </div>
      </div>
      <div class="header-right">
        <span class="tag">100 % local · aucune donnée envoyée</span>
        <button
          class="theme-btn"
          :title="theme === 'dark' ? 'Passer en thème clair' : 'Passer en thème sombre'"
          :aria-label="theme === 'dark' ? 'Thème clair' : 'Thème sombre'"
          @click="toggle"
        >
          {{ theme === "dark" ? "☀ Clair" : "☾ Sombre" }}
        </button>
      </div>
    </header>
    <View />
  </div>
</template>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.theme-btn {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  transition: border-color 0.15s, color 0.15s;
}
.theme-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.logo {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  object-fit: contain;
  display: block;
}
.brand h1 {
  font-size: 1.15rem;
  letter-spacing: 0.5px;
}
.brand p {
  margin: 0.1rem 0 0;
  font-size: 0.78rem;
  color: var(--text-dim);
}
@media (max-width: 640px) {
  .app-header {
    padding: 0.75rem 1rem;
  }
  .brand p {
    display: none;
  }
  .app-header .tag {
    display: none;
  }
}
</style>
