<script setup>
import View from "./components/View.vue";
import { useTheme } from "./composables/useTheme.js";
import { useI18n } from "./i18n/index.js";
import { useNav } from "./composables/useNav.js";
import logoUrl from "./assets/logo.svg";

const { theme, toggle } = useTheme();
const { t, locale, setLocale, LOCALES } = useI18n();
const { toggle: toggleNav } = useNav();
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="brand">
        <button
          class="burger"
          :aria-label="t('nav.menu')"
          :title="t('nav.menu')"
          @click="toggleNav"
        >
          <span></span><span></span><span></span>
        </button>
        <img :src="logoUrl" class="logo" alt="Morpho" />
        <div>
          <h1>Morpho</h1>
          <p>{{ t("app.tagline") }}</p>
        </div>
      </div>
      <div class="header-right">
        <span class="tag">{{ t("app.local") }}</span>
        <select
          class="lang-sel"
          :value="locale"
          :aria-label="t('app.uiLang')"
          :title="t('app.uiLang')"
          @change="setLocale($event.target.value)"
        >
          <option v-for="l in LOCALES" :key="l.code" :value="l.code">
            {{ l.label }}
          </option>
        </select>
        <button
          class="theme-btn"
          :title="theme === 'dark' ? t('app.toLight') : t('app.toDark')"
          :aria-label="theme === 'dark' ? t('app.toLight') : t('app.toDark')"
          @click="toggle"
        >
          {{ theme === "dark" ? "☀" : "☾" }}
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
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Respecte l'encoche et les bords arrondis des téléphones. */
  padding: calc(1rem + env(safe-area-inset-top))
    calc(1.5rem + env(safe-area-inset-right)) 1rem
    calc(1.5rem + env(safe-area-inset-left));
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.lang-sel {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.35rem 0.6rem;
  font-size: 0.78rem;
  font-family: inherit;
}
.theme-btn {
  background: var(--surface-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 999px;
  width: 32px;
  height: 32px;
  font-size: 0.9rem;
  display: grid;
  place-items: center;
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
.burger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 36px;
  height: 36px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 8px;
}
.burger span {
  display: block;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
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
@media (max-width: 860px) {
  .burger {
    display: flex;
    width: 42px;
    height: 42px;
  }
}
@media (max-width: 640px) {
  .app-header {
    padding: calc(0.6rem + env(safe-area-inset-top))
      calc(1rem + env(safe-area-inset-right)) 0.6rem
      calc(1rem + env(safe-area-inset-left));
  }
  .brand p {
    display: none;
  }
  .app-header .tag {
    display: none;
  }
  /* Cibles tactiles confortables. */
  .theme-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  .lang-sel {
    padding: 0.5rem 0.7rem;
  }
}
</style>
