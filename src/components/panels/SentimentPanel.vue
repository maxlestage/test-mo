<script setup>
import { computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import BarChart from "../BarChart.vue";

const { sentiment } = useAnalysis();

const levelClass = computed(() => {
  const l = sentiment.value.label;
  return l === "positif" ? "level-easy" : l === "négatif" ? "level-hard" : "level-ok";
});

const distribution = computed(() => {
  const c = sentiment.value.counts;
  return [
    { label: "Positives", value: c.positif },
    { label: "Neutres", value: c.neutre },
    { label: "Négatives", value: c["négatif"] },
  ];
});
</script>

<template>
  <div class="senti">
    <p class="intro">
      Détection lexicale du ressenti exprimé dans le texte (lexique
      français/anglais, gestion de la négation et des adverbes d'intensité).
      Analyse purement locale — aucune donnée n'est envoyée.
    </p>

    <div class="top">
      <div class="verdict">
        <span class="kicker">Tonalité globale</span>
        <span class="label" :class="levelClass">
          {{ sentiment.label }}
        </span>
        <div class="gauge">
          <div class="gauge-fill" :style="{ width: sentiment.positivity + '%' }" />
        </div>
        <span class="gauge-cap">
          Indice de positivité : <strong>{{ sentiment.positivity }}/100</strong>
        </span>
      </div>

      <div class="mini">
        <div class="stat">
          <span class="num">{{ sentiment.meanPerSentence.toFixed(2) }}</span>
          <span class="cap">Score moyen / phrase</span>
        </div>
        <div class="stat">
          <span class="num">{{ sentiment.sentenceCount }}</span>
          <span class="cap">Phrases analysées</span>
        </div>
        <div class="stat">
          <span class="num">{{ sentiment.analyzedWords }}</span>
          <span class="cap">Mots porteurs d'émotion</span>
        </div>
      </div>
    </div>

    <div class="block">
      <h3>Répartition des phrases</h3>
      <BarChart :data="distribution" />
    </div>

    <div class="cols">
      <section class="block">
        <h3>Mots positifs marquants</h3>
        <ul class="words">
          <li v-for="w in sentiment.topPositive" :key="w.word">
            <span class="mono">{{ w.word }}</span>
            <span class="pos">+{{ w.total.toFixed(1) }}</span>
            <span class="dim">×{{ w.count }}</span>
          </li>
          <li v-if="!sentiment.topPositive.length" class="dim">Aucun</li>
        </ul>
      </section>
      <section class="block">
        <h3>Mots négatifs marquants</h3>
        <ul class="words">
          <li v-for="w in sentiment.topNegative" :key="w.word">
            <span class="mono">{{ w.word }}</span>
            <span class="neg">{{ w.total.toFixed(1) }}</span>
            <span class="dim">×{{ w.count }}</span>
          </li>
          <li v-if="!sentiment.topNegative.length" class="dim">Aucun</li>
        </ul>
      </section>
    </div>

    <div class="cols">
      <section class="block">
        <h3>Phrases les plus positives</h3>
        <p
          v-for="(s, i) in sentiment.mostPositive"
          :key="'p' + i"
          class="quote pos-q"
        >
          <span class="badge pos">+{{ s.score.toFixed(1) }}</span>
          {{ s.text }}
        </p>
        <p v-if="!sentiment.mostPositive.length" class="dim">Aucune.</p>
      </section>
      <section class="block">
        <h3>Phrases les plus négatives</h3>
        <p
          v-for="(s, i) in sentiment.mostNegative"
          :key="'n' + i"
          class="quote neg-q"
        >
          <span class="badge neg">{{ s.score.toFixed(1) }}</span>
          {{ s.text }}
        </p>
        <p v-if="!sentiment.mostNegative.length" class="dim">Aucune.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
.senti {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.intro {
  color: var(--text-dim);
  font-size: 0.88rem;
  max-width: 75ch;
  line-height: 1.55;
  margin: 0;
}
.top {
  display: grid;
  grid-template-columns: 1.2fr 2fr;
  gap: 1rem;
}
.verdict,
.block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
}
.verdict {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.kicker {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}
.label {
  font-size: 1.7rem;
  font-weight: 800;
  text-transform: capitalize;
}
.gauge {
  height: 10px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--hard), var(--warn), var(--ok));
  position: relative;
  opacity: 0.35;
}
.gauge-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--hard), var(--warn), var(--ok));
  opacity: 1;
}
.gauge-cap {
  font-size: 0.8rem;
  color: var(--text-dim);
}
.mini {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
.stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  justify-content: center;
}
.num {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}
.cap {
  font-size: 0.76rem;
  color: var(--text-dim);
}
.block h3 {
  font-size: 0.95rem;
  margin-bottom: 1rem;
}
.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.words {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
}
.words li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.mono {
  font-family: var(--mono);
  flex: 1;
}
.pos {
  color: var(--ok);
  font-family: var(--mono);
}
.neg {
  color: var(--hard);
  font-family: var(--mono);
}
.dim {
  color: var(--text-dim);
}
.quote {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0 0 0.7rem;
  padding-left: 0.75rem;
  border-left: 3px solid var(--border);
}
.pos-q {
  border-left-color: var(--ok);
}
.neg-q {
  border-left-color: var(--hard);
}
.badge {
  font-family: var(--mono);
  font-size: 0.75rem;
  font-weight: 700;
  margin-right: 0.4rem;
}
.badge.pos {
  color: var(--ok);
}
.badge.neg {
  color: var(--hard);
}
@media (max-width: 860px) {
  .top,
  .cols {
    grid-template-columns: 1fr;
  }
  .mini {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
