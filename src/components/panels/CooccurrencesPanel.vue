<script setup>
import { computed, ref } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import { cooccurrences } from "../../libs/textometry.js";

const { text, lang, settings } = useAnalysis();
const { t } = useI18n();

const keyword = ref("");
const win = ref(5);
const caseSensitive = ref(false);

const result = computed(() =>
  cooccurrences(text.value, keyword.value.trim(), {
    window: win.value,
    caseSensitive: caseSensitive.value,
    lang: lang.value,
    removeStopwords: settings.value.removeStopwords || true,
    minFreq: 2,
    top: 40,
  })
);

const showPrompt = computed(() => !keyword.value.trim());
const showNotFound = computed(
  () => !showPrompt.value && result.value.keywordCount === 0
);
</script>

<template>
  <div class="cooc">
    <p class="intro">{{ t("co.intro") }}</p>

    <div class="toolbar">
      <input v-model="keyword" :placeholder="t('co.placeholder')" />
      <label>
        {{ t("co.window") }}
        <select v-model.number="win">
          <option :value="3">±3</option>
          <option :value="5">±5</option>
          <option :value="8">±8</option>
          <option :value="12">±12</option>
        </select>
      </label>
      <label class="check">
        <input v-model="caseSensitive" type="checkbox" />
        <span>{{ t("co.case") }}</span>
      </label>
      <span v-if="result.keywordCount" class="tag">
        {{ result.keywordCount }} {{ t("co.keywordOcc") }}
      </span>
    </div>

    <p v-if="showPrompt" class="muted">{{ t("co.empty") }}</p>
    <p v-else-if="showNotFound" class="muted">{{ t("co.notFound") }}</p>

    <div v-else class="block">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{{ t("co.word") }}</th>
              <th>{{ t("co.fWindow") }}</th>
              <th>{{ t("co.fTotal") }}</th>
              <th>{{ t("co.score") }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in result.rows" :key="r.word">
              <td class="mono">{{ r.word }}</td>
              <td class="v">{{ r.fWindow }}</td>
              <td class="v dim">{{ r.fTotal }}</td>
              <td class="v" :class="r.score >= 0 ? 'pos' : 'neg'">
                {{ (r.score >= 0 ? "+" : "") + r.score.toFixed(1) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cooc {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
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
.muted {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin: 0;
}
.block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
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
