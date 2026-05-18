<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCorpusStore } from "../../stores/corpus.js";
import { useI18n } from "../../i18n/index.js";
import {
  basicStats,
  lexicalDiversity,
  readabilityInputs,
} from "../../libs/linguistics.js";
import { lix } from "../../libs/readability.js";
import { analyzeSentiment } from "../../libs/sentiment.js";
import { tokenizeWords } from "../../libs/text.js";

const store = useCorpusStore();
const { documents } = storeToRefs(store);
const { t } = useI18n();

const rows = computed(() =>
  documents.value.map((d) => {
    const s = basicStats(d.content);
    const div = lexicalDiversity(tokenizeWords(d.content));
    const lx = lix(readabilityInputs(d.content));
    const senti = analyzeSentiment(d.content);
    return {
      id: d.id,
      name: d.name,
      words: s.words,
      sentences: s.sentences,
      wps: s.avgSentenceLength,
      ttr: div.ttr,
      lix: lx == null ? null : lx,
      positivity: senti.positivity,
      mood: senti.label,
    };
  })
);

function agg(key) {
  const vals = rows.value
    .map((r) => r[key])
    .filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (!vals.length) return { min: 0, max: 0, avg: 0, median: 0 };
  const sorted = [...vals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    median:
      sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2,
  };
}

const totalWords = computed(() =>
  rows.value.reduce((a, r) => a + r.words, 0)
);
const cols = ["words", "sentences", "wps", "ttr", "lix", "positivity"];
const fmt = (key, v) => {
  if (v == null) return "—";
  if (key === "ttr") return v.toFixed(3);
  if (key === "wps" || key === "lix") return v.toFixed(1);
  return Math.round(v).toLocaleString();
};
const moodClass = (m) =>
  m === "positif" ? "level-easy" : m === "négatif" ? "level-hard" : "level-ok";
</script>

<template>
  <div class="corpus">
    <p class="intro">{{ t("cp.intro") }}</p>

    <div class="grid">
      <div class="card">
        <span class="val">{{ documents.length }}</span>
        <span class="lbl">{{ t("cp.docs") }}</span>
      </div>
      <div class="card">
        <span class="val">{{ totalWords.toLocaleString() }}</span>
        <span class="lbl">{{ t("cp.totalWords") }}</span>
      </div>
      <div class="card">
        <span class="val">
          {{ documents.length ? Math.round(agg("words").avg).toLocaleString() : 0 }}
        </span>
        <span class="lbl">{{ t("cp.avgWords") }}</span>
      </div>
    </div>

    <p v-if="documents.length < 2" class="muted">{{ t("cp.one") }}</p>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{{ t("cp.doc") }}</th>
            <th>{{ t("cp.words") }}</th>
            <th>{{ t("cp.sentences") }}</th>
            <th>{{ t("cp.wps") }}</th>
            <th>{{ t("cp.ttr") }}</th>
            <th>{{ t("cp.read") }}</th>
            <th>{{ t("cp.senti") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td class="name" :title="r.name">{{ r.name }}</td>
            <td class="v">{{ r.words.toLocaleString() }}</td>
            <td class="v">{{ r.sentences }}</td>
            <td class="v">{{ r.wps.toFixed(1) }}</td>
            <td class="v">{{ r.ttr.toFixed(3) }}</td>
            <td class="v">{{ r.lix == null ? "—" : r.lix.toFixed(1) }}</td>
            <td class="v">
              <span :class="moodClass(r.mood)">{{ r.positivity }}/100</span>
            </td>
          </tr>
        </tbody>
        <tfoot v-if="rows.length">
          <tr v-for="stat in ['min', 'max', 'avg', 'median']" :key="stat">
            <td class="agg">{{ t("cp." + stat) }}</td>
            <td v-for="c in cols" :key="c" class="v agg">
              {{ fmt(c, agg(c)[stat]) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
.corpus {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.intro {
  color: var(--text-dim);
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
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
.muted {
  color: var(--text-dim);
  font-size: 0.82rem;
  margin: 0;
}
.table-wrap {
  overflow-x: auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}
th,
td {
  text-align: left;
  padding: 0.5rem 0.7rem;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
th {
  color: var(--text-dim);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.v {
  text-align: right;
  font-family: var(--mono);
}
.name {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
}
tfoot .agg {
  color: var(--text-dim);
  font-weight: 600;
  border-top: 2px solid var(--border);
}
</style>
