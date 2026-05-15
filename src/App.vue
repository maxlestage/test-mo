<script setup>
import View from "./components/View.vue";
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="brand">
        <span class="logo">L</span>
        <div>
          <h1>Lexikon</h1>
          <p>Atelier d'analyse linguistique de texte</p>
        </div>
      </div>
      <span class="tag">100 % local · aucune donnée envoyée</span>
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
.brand {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.logo {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  background: var(--accent);
  color: #1a1100;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.3rem;
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
</style>
