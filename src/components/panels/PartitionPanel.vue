<script setup>
import { computed, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useCorpusStore } from "../../stores/corpus.js";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import { tokenizeWords } from "../../libs/text.js";
import { specificities } from "../../libs/textometry.js";

const store = useCorpusStore();
const { documents } = storeToRefs(store);
const { lang, settings } = useAnalysis();
const { t } = useI18n();

// Attribution par défaut : 1er document en A, les autres en B.
const groups = reactive({});
function ensureDefaults() {
  documents.value.forEach((d, i) => {
    if (!(d.id in groups)) groups[d.id] = i === 0 ? "A" : "B";
  });
}
ensureDefaults();

function setGroup(id, g) {
  groups[id] = g;
}

const aDocs = computed(() =>
  documents.value.filter((d) => groups[d.id] === "A")
);
const bDocs = computed(() =>
  documents.value.filter((d) => groups[d.id] === "B")
);

const result = computed(() => {
  if (!aDocs.value.length || !bDocs.value.length) return null;
  const a = aDocs.value.flatMap((d) => tokenizeWords(d.content));
  const b = bDocs.value.flatMap((d) => tokenizeWords(d.content));
  return specificities(a, b, {
    lang: lang.value,
    removeStopwords: settings.value.removeStopwords,
    minFreq: 2,
    top: 60,
  });
});

const over = computed(() =>
  result.value ? result.value.filter((r) => r.score > 0).slice(0, 20) : []
);
const under = computed(() =>
  result.value ? result.value.filter((r) => r.score < 0).slice(0, 20) : []
);
</script>

<template>
  <div class="part">
    <p class="intro">{{ t("pt.intro") }}</p>

    <div class="docs">
      <div v-for="d in documents" :key="d.id" class="row">
        <span class="name" :title="d.name">{{ d.name }}</span>
        <div class="seg">
          <button
            v-for="g in ['A', '–', 'B']"
            :key="g"
            :class="{ on: (groups[d.id] || '–') === (g === '–' ? 'ignore' : g) }"
            @click="setGroup(d.id, g === '–' ? 'ignore' : g)"
          >
            {{ g === '–' ? t('pt.ignore').charAt(0) : g }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="!result" class="muted">{{ t("pt.need") }}</p>

    <div v-else class="cols">
      <section class="block">
        <h3 class="over">▲ {{ t("pt.over") }}</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mot</th>
                <th>A</th>
                <th>B</th>
                <th>G²</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in over" :key="r.word">
                <td class="mono">{{ r.word }}</td>
                <td class="v">{{ r.fSub }}</td>
                <td class="v dim">{{ r.fRest }}</td>
                <td class="v pos">+{{ r.score.toFixed(1) }}</td>
              </tr>
              <tr v-if="!over.length">
                <td colspan="4" class="dim">{{ t("pt.empty") }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="block">
        <h3 class="under">▼ {{ t("pt.under") }}</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mot</th>
                <th>A</th>
                <th>B</th>
                <th>G²</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in under" :key="r.word">
                <td class="mono">{{ r.word }}</td>
                <td class="v dim">{{ r.fSub }}</td>
                <td class="v">{{ r.fRest }}</td>
                <td class="v neg">{{ r.score.toFixed(1) }}</td>
              </tr>
              <tr v-if="!under.length">
                <td colspan="4" class="dim">{{ t("pt.empty") }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.part {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.intro {
  color: var(--text-dim);
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0;
  max-width: 78ch;
}
.muted {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin: 0;
}
.docs {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.6rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.name {
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.seg {
  display: flex;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}
.seg button {
  background: var(--surface-2);
  border: none;
  color: var(--text-dim);
  width: 34px;
  padding: 0.32rem 0;
  font-size: 0.78rem;
  font-weight: 600;
}
.seg button.on {
  background: var(--accent);
  color: #1a1100;
}
.cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  padding: 1.1rem;
}
h3 {
  font-size: 0.95rem;
  margin-bottom: 0.85rem;
}
h3.over {
  color: var(--ok);
}
h3.under {
  color: var(--hard);
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}
th,
td {
  text-align: left;
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
th {
  color: var(--text-dim);
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
.pos {
  color: var(--ok);
  font-weight: 600;
}
.neg {
  color: var(--hard);
  font-weight: 600;
}
</style>
