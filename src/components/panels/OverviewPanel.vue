<script setup>
import { computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import BarChart from "../BarChart.vue";

const { stats, lang, wordLengths } = useAnalysis();
const { t } = useI18n();

const cards = computed(() => [
  { label: t("ov.words"), value: stats.value.words.toLocaleString() },
  { label: t("ov.unique"), value: stats.value.uniqueWords.toLocaleString() },
  { label: t("ov.sentences"), value: stats.value.sentences.toLocaleString() },
  { label: t("ov.paragraphs"), value: stats.value.paragraphs.toLocaleString() },
  { label: t("ov.chars"), value: stats.value.characters.toLocaleString() },
  { label: t("ov.charsNs"), value: stats.value.charactersNoSpaces.toLocaleString() },
  { label: t("ov.awl"), value: stats.value.avgWordLength.toFixed(2) },
  { label: t("ov.wps"), value: stats.value.avgSentenceLength.toFixed(1) },
]);

const readingTime = computed(() => {
  const min = stats.value.readingTimeMin;
  if (min < 1) return `${Math.round(min * 60)} s`;
  return `${Math.round(min)} min`;
});

const lengthChart = computed(() =>
  wordLengths.value.map((d) => ({
    label: `${d.length} ${t("ov.letters")}`,
    value: d.count,
  }))
);
</script>

<template>
  <div class="overview">
    <div class="meta">
      <span class="tag">{{ t("ov.lang") }} : {{ lang === "fr" ? t("mgr.fr") : t("mgr.en") }}</span>
      <span class="tag">{{ t("ov.reading") }} ≈ {{ readingTime }}</span>
      <span class="tag">{{ t("ov.longest") }} : {{ stats.longestWord || "—" }}</span>
    </div>

    <div class="grid">
      <div v-for="c in cards" :key="c.label" class="card">
        <span class="val">{{ c.value }}</span>
        <span class="lbl">{{ c.label }}</span>
      </div>
    </div>

    <div class="block">
      <h3>{{ t("ov.distTitle") }}</h3>
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
