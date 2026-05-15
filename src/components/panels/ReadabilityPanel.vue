<script setup>
import { computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import {
  fleschReadingEase,
  fleschKincaidGrade,
  kandelMoles,
  lix,
  interpretFlesch,
  interpretLix,
} from "../../libs/readability.js";

const { readability, lang } = useAnalysis();

const scores = computed(() => {
  const r = readability.value;
  const out = [];

  if (lang.value === "fr") {
    const km = kandelMoles(r);
    out.push({
      name: "Flesch — Kandel & Moles (FR)",
      score: km == null ? "—" : km.toFixed(1),
      ...interpretFlesch(km),
      hint: "Adaptation française de l'indice de Flesch. 0 = très difficile, 100 = très facile.",
    });
  } else {
    const fre = fleschReadingEase(r);
    out.push({
      name: "Flesch Reading Ease (EN)",
      score: fre == null ? "—" : fre.toFixed(1),
      ...interpretFlesch(fre),
      hint: "Indice de facilité de lecture. 0 = très difficile, 100 = très facile.",
    });
    const fk = fleschKincaidGrade(r);
    out.push({
      name: "Flesch–Kincaid Grade",
      score: fk == null ? "—" : fk.toFixed(1),
      label: fk == null ? "—" : `Niveau scolaire ≈ ${Math.max(0, Math.round(fk))}`,
      level: "ok",
      hint: "Niveau de scolarité (US) requis pour comprendre le texte.",
    });
  }

  const lx = lix(r);
  out.push({
    name: "LIX (indépendant de la langue)",
    score: lx == null ? "—" : lx.toFixed(1),
    ...interpretLix(lx),
    hint: "Mots/phrase + 100 × mots longs/mots. < 30 facile, > 60 difficile.",
  });

  return out;
});
</script>

<template>
  <div class="read">
    <div class="stats">
      <span class="tag">{{ readability.words }} mots</span>
      <span class="tag">{{ readability.sentences }} phrases</span>
      <span class="tag">{{ readability.syllables }} syllabes</span>
      <span class="tag">{{ readability.longWords }} mots longs (&gt; 6)</span>
    </div>
    <div class="list">
      <div v-for="s in scores" :key="s.name" class="score">
        <div class="top">
          <span class="name">{{ s.name }}</span>
          <span class="num">{{ s.score }}</span>
        </div>
        <span class="badge" :class="'level-' + s.level">{{ s.label }}</span>
        <p class="hint">{{ s.hint }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.read {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.stats {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.85rem;
}
.score {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.name {
  font-size: 0.85rem;
  font-weight: 600;
}
.num {
  font-family: var(--mono);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent);
}
.badge {
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
}
.hint {
  margin: 0;
  font-size: 0.77rem;
  color: var(--text-dim);
  line-height: 1.5;
}
</style>
