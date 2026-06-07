<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCorpusStore } from "../../stores/corpus.js";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import { tokenizeWords } from "../../libs/text.js";
import { specificities } from "../../libs/textometry.js";

const store = useCorpusStore();
const { documents } = storeToRefs(store);
const { document: activeDoc, lang, settings } = useAnalysis();
const { t } = useI18n();

const result = computed(() => {
  const a = activeDoc.value;
  if (!a) return null;
  const others = documents.value.filter((d) => d.id !== a.id);
  if (!others.length) return null;
  const sub = tokenizeWords(a.content);
  const rest = others.flatMap((d) => tokenizeWords(d.content));
  return specificities(sub, rest, {
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
  <div class="spec">
    <p class="intro">{{ t("xp.intro") }}</p>
    <p v-if="!result" class="muted">{{ t("xp.need") }}</p>
    <div v-else class="cols">
      <section class="block">
        <h3 class="over">▲ {{ t("xp.over") }}</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t("xp.word") }}</th>
                <th>{{ t("xp.fSub") }}</th>
                <th>{{ t("xp.fRest") }}</th>
                <th>{{ t("xp.score") }}</th>
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
                <td colspan="4" class="dim">{{ t("xp.empty") }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section class="block">
        <h3 class="under">▼ {{ t("xp.under") }}</h3>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{{ t("xp.word") }}</th>
                <th>{{ t("xp.fSub") }}</th>
                <th>{{ t("xp.fRest") }}</th>
                <th>{{ t("xp.score") }}</th>
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
                <td colspan="4" class="dim">{{ t("xp.empty") }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.spec {
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
