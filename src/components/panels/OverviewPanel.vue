<script setup>
import { computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import BarChart from "../BarChart.vue";

const { stats, lang, wordLengths } = useAnalysis();

const cards = computed(() => [
  { label: "Mots", value: stats.value.words.toLocaleString("fr-FR") },
  { label: "Mots uniques", value: stats.value.uniqueWords.toLocaleString("fr-FR") },
  { label: "Phrases", value: stats.value.sentences.toLocaleString("fr-FR") },
  { label: "Paragraphes", value: stats.value.paragraphs.toLocaleString("fr-FR") },
  { label: "Caractères", value: stats.value.characters.toLocaleString("fr-FR") },
  { label: "Sans espaces", value: stats.value.charactersNoSpaces.toLocaleString("fr-FR") },
  { label: "Long. moy. mot", value: stats.value.avgWordLength.toFixed(2) },
  { label: "Mots / phrase", value: stats.value.avgSentenceLength.toFixed(1) },
]);

const readingTime = computed(() => {
  const min = stats.value.readingTimeMin;
  if (min < 1) return `${Math.round(min * 60)} s`;
  return `${Math.round(min)} min`;
});

const lengthChart = computed(() =>
  wordLengths.value.map((d) => ({ label: `${d.length} lettres`, value: d.count }))
);
</script>

<template>
  <div class="overview">
    <div class="meta">
      <span class="tag">Langue : {{ lang === "fr" ? "français" : "anglais" }}</span>
      <span class="tag">Temps de lecture ≈ {{ readingTime }}</span>
      <span class="tag">Mot le plus long : {{ stats.longestWord || "—" }}</span>
    </div>

    <div class="grid">
      <div v-for="c in cards" :key="c.label" class="card">
        <span class="val">{{ c.value }}</span>
        <span class="lbl">{{ c.label }}</span>
      </div>
    </div>

    <div class="block">
      <h3>Distribution de la longueur des mots</h3>
      <BarChart :data="lengthChart" />
    </div>
  </div>
</template>

<style scoped>
.overview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.val {
  font-size: 1.5rem;
  font-weight: 700;
  font-family: var(--mono);
  color: var(--accent);
}
.lbl {
  font-size: 0.78rem;
  color: var(--text-dim);
}
.block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
}
.block h3 {
  font-size: 0.95rem;
  margin-bottom: 1rem;
}
</style>
