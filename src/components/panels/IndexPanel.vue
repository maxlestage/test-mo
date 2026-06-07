<script setup>
import { computed, ref } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import { tokenizeWords } from "../../libs/text.js";

const { text } = useAnalysis();
const { t } = useI18n();

const filter = ref("");

const all = computed(() => {
  const counts = new Map();
  for (const w of tokenizeWords(text.value)) {
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count, ratio: total ? count / total : 0 }))
    .sort((a, b) => a.word.localeCompare(b.word));
});

const filtered = computed(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return all.value;
  return all.value.filter((r) => r.word.startsWith(q));
});

const shown = computed(() => filtered.value.slice(0, 500));
</script>

<template>
  <div class="ix">
    <p class="intro">{{ t("ix.intro") }}</p>
    <div class="toolbar">
      <input v-model="filter" :placeholder="t('ix.filter')" />
      <span class="tag">
        {{ filtered.length.toLocaleString() }} {{ t("ix.results") }}
      </span>
    </div>
    <div class="block">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t("ix.word") }}</th>
              <th>{{ t("ix.count") }}</th>
              <th>{{ t("ix.freq") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in shown" :key="r.word">
              <td class="mono">{{ r.word }}</td>
              <td class="v">{{ r.count }}</td>
              <td class="v dim">{{ (r.ratio * 100).toFixed(2) }} %</td>
            </tr>
            <tr v-if="!shown.length">
              <td colspan="3" class="dim">{{ t("ix.empty") }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ix {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.intro {
  color: var(--text-dim);
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0;
  max-width: 78ch;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.toolbar input {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text);
  padding: 0.45rem 0.6rem;
  font-size: 0.82rem;
  font-family: inherit;
  flex: 1;
  max-width: 320px;
}
.block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.4rem 0.6rem;
}
.table-wrap {
  max-height: 60vh;
  overflow: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}
th,
td {
  text-align: left;
  padding: 0.35rem 0.6rem;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
th {
  color: var(--text-dim);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  position: sticky;
  top: 0;
  background: var(--surface);
}
.mono {
  font-family: var(--mono);
}
.v {
  text-align: right;
  font-family: var(--mono);
}
.dim {
  color: var(--text-dim);
}
</style>
