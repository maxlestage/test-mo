<script setup>
import { computed, ref } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import BarChart from "../BarChart.vue";

const { frequencies, settings } = useAnalysis();
const query = ref("");
const topN = ref(25);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q
    ? frequencies.value.filter((f) => f.word.includes(q))
    : frequencies.value;
});

const chartData = computed(() =>
  filtered.value
    .slice(0, topN.value)
    .map((f) => ({ label: f.word, value: f.count }))
);
</script>

<template>
  <div class="freq">
    <div class="toolbar">
      <input v-model="query" placeholder="Filtrer un mot…" />
      <label>
        Top
        <select v-model.number="topN">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </label>
      <span class="tag">
        Mots vides {{ settings.removeStopwords ? "exclus" : "inclus" }}
      </span>
    </div>

    <div class="block">
      <BarChart
        :data="chartData"
        :value-format="(v) => v.toLocaleString('fr-FR')"
      />
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Mot</th>
          <th>Occurrences</th>
          <th>Fréquence</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(f, i) in filtered.slice(0, topN)" :key="f.word">
          <td class="dim">{{ i + 1 }}</td>
          <td class="mono">{{ f.word }}</td>
          <td>{{ f.count }}</td>
          <td class="dim">{{ (f.ratio * 100).toFixed(2) }} %</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.freq {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.toolbar input,
.toolbar select {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text);
  padding: 0.45rem 0.6rem;
  font-size: 0.82rem;
  font-family: inherit;
}
.toolbar label {
  font-size: 0.82rem;
  color: var(--text-dim);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.check {
  cursor: default;
}
.block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
th,
td {
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border);
}
th {
  color: var(--text-dim);
  font-weight: 600;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.mono {
  font-family: var(--mono);
}
.dim {
  color: var(--text-dim);
}
</style>
