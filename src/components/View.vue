<script setup>
import { ref, watch } from "vue";
import { useAnalysis } from "../composables/useAnalysis.js";
import DocumentManager from "./DocumentManager.vue";
import OverviewPanel from "./panels/OverviewPanel.vue";
import FrequencyPanel from "./panels/FrequencyPanel.vue";
import DiversityPanel from "./panels/DiversityPanel.vue";
import ReadabilityPanel from "./panels/ReadabilityPanel.vue";
import NgramPanel from "./panels/NgramPanel.vue";
import ConcordancePanel from "./panels/ConcordancePanel.vue";
import SentimentPanel from "./panels/SentimentPanel.vue";

const { document, hasContent } = useAnalysis();

const tabs = [
  { id: "overview", label: "Vue d'ensemble", comp: OverviewPanel },
  { id: "frequency", label: "Fréquences", comp: FrequencyPanel },
  { id: "diversity", label: "Richesse lexicale", comp: DiversityPanel },
  { id: "readability", label: "Lisibilité", comp: ReadabilityPanel },
  { id: "sentiment", label: "Sentiment", comp: SentimentPanel },
  { id: "ngram", label: "N-grammes", comp: NgramPanel },
  { id: "kwic", label: "Concordance", comp: ConcordancePanel },
];
const active = ref("overview");
const menuOpen = ref(false);

// Sur mobile, refermer le tiroir dès qu'un document devient actif.
watch(
  () => document.value?.id,
  () => {
    menuOpen.value = false;
  }
);
</script>

<template>
  <div class="layout">
    <button
      class="menu-btn"
      :aria-expanded="menuOpen"
      @click="menuOpen = !menuOpen"
    >
      ☰ Corpus
    </button>

    <div
      v-if="menuOpen"
      class="backdrop"
      @click="menuOpen = false"
    />

    <DocumentManager :class="{ open: menuOpen }" />

    <main class="content">
      <template v-if="document && hasContent">
        <div class="doc-title">
          <h2>{{ document.name }}</h2>
        </div>
        <nav class="tabs">
          <button
            v-for="t in tabs"
            :key="t.id"
            :class="{ on: active === t.id }"
            @click="active = t.id"
          >
            {{ t.label }}
          </button>
        </nav>
        <section class="panel">
          <component :is="tabs.find((t) => t.id === active).comp" />
        </section>
      </template>

      <div v-else class="empty">
        <div class="empty-card">
          <h2>Bienvenue dans Mo-Grid</h2>
          <p>
            Importez un fichier <code>.txt</code>/<code>.md</code>, collez un
            texte ou chargez les exemples depuis le panneau Corpus pour lancer
            l'analyse linguistique.
          </p>
          <ul>
            <li>Statistiques de texte et longueur des mots</li>
            <li>Fréquences lexicales et filtrage des mots vides</li>
            <li>Richesse lexicale (TTR, Guiraud, Herdan, Maas…)</li>
            <li>Indices de lisibilité (Flesch, Kandel & Moles, LIX)</li>
            <li>N-grammes, collocations (PMI) et concordance (KWIC)</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
}
.menu-btn {
  display: none;
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  z-index: 60;
  background: var(--accent);
  color: #1a1100;
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 4px 14px #0008;
}
.backdrop {
  display: none;
  position: absolute;
  inset: 0;
  background: #0009;
  z-index: 40;
}
.content {
  flex: 1;
  min-width: 0;
  padding: 1.5rem 2rem;
  overflow-y: auto;
}
.doc-title h2 {
  font-size: 1.05rem;
  margin-bottom: 1rem;
  word-break: break-word;
}
.tabs {
  display: flex;
  gap: 0.3rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1.5rem;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.tabs button {
  background: none;
  border: none;
  color: var(--text-dim);
  padding: 0.6rem 0.9rem;
  font-size: 0.85rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
}
.tabs button:hover {
  color: var(--text);
}
.tabs button.on {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}
.empty {
  display: grid;
  place-items: center;
  height: 100%;
}
.empty-card {
  max-width: 520px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
}
.empty-card h2 {
  margin-bottom: 0.75rem;
}
.empty-card p {
  color: var(--text-dim);
  line-height: 1.6;
  font-size: 0.9rem;
}
.empty-card ul {
  color: var(--text-dim);
  font-size: 0.85rem;
  line-height: 1.8;
  margin: 1rem 0 0;
  padding-left: 1.1rem;
}
code {
  font-family: var(--mono);
  background: var(--surface-2);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.85em;
}

@media (max-width: 860px) {
  .menu-btn {
    display: block;
  }
  .backdrop {
    display: block;
  }
  .content {
    padding: 1.25rem 1rem 4.5rem;
  }
}
</style>
