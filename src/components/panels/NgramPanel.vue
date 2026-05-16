<script setup>
import { computed, ref } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import { ngrams, collocations } from "../../libs/linguistics.js";
import BarChart from "../BarChart.vue";

const { words, lang, settings } = useAnalysis();
const { t } = useI18n();
const n = ref(2);

const grams = computed(() =>
  ngrams(words.value, n.value, {
    lang: lang.value,
    removeStopwords: settings.value.removeStopwords,
  }).slice(0, 20)
);

const gramChart = computed(() =>
  grams.value.slice(0, 15).map((g) => ({ label: g.gram, value: g.count }))
);

const colloc = computed(() =>
  collocations(words.value, { lang: lang.value, minCount: 2 }).slice(0, 20)
);
</script>

<template>
  <div class="ngram">
    <div class="cols">
      <section class="block">
        <div class="block-head">
          <h3>{{ t("ng.title") }}</h3>
          <div class="seg">
            <button
              v-for="k in [2, 3, 4]"
              :key="k"
              :class="{ on: n === k }"
              @click="n = k"
            >
              {{ k }}{{ t("ng.grams") }}
            </button>
          </div>
        </div>
        <BarChart :data="gramChart" />
      </section>

      <section class="block">
        <h3>{{ t("ng.colloc") }}</h3>
        <p class="muted">{{ t("ng.collocDesc") }}</p>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t("ng.bigram") }}</th>
                <th>{{ t("ng.occ") }}</th>
                <th>PMI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in colloc" :key="c.gram">
                <td class="mono">{{ c.gram }}</td>
                <td>{{ c.count }}</td>
                <td class="dim">{{ c.pmi.toFixed(2) }}</td>
              </tr>
              <tr v-if="!colloc.length">
                <td colspan="3" class="dim">{{ t("ng.short") }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.table-wrap {
  overflow-x: auto;
}
@media (max-width: 900px) {
  .cols {
    grid-template-columns: 1fr;
  }
}
.block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
}
.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
  flex-wrap: wrap;
}
h3 {
  font-size: 0.95rem;
}
.seg {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.seg button {
  background: var(--surface-2);
  border: none;
  color: var(--text-dim);
  padding: 0.4rem 0.7rem;
  font-size: 0.78rem;
}
.seg button.on {
  background: var(--accent);
  color: #1a1100;
  font-weight: 600;
}
.muted {
  color: var(--text-dim);
  font-size: 0.8rem;
  margin: 0 0 1rem;
  line-height: 1.5;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}
th,
td {
  text-align: left;
  padding: 0.45rem 0.6rem;
  border-bottom: 1px solid var(--border);
}
th {
  color: var(--text-dim);
  font-size: 0.75rem;
  text-transform: uppercase;
}
.mono {
  font-family: var(--mono);
}
.dim {
  color: var(--text-dim);
}
</style>
