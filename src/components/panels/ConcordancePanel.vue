<script setup>
import { computed, ref } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import { concordance } from "../../libs/linguistics.js";

const { text } = useAnalysis();
const { t } = useI18n();
const keyword = ref("");
const contextWords = ref(6);
const caseSensitive = ref(false);

const lines = computed(() => {
  if (!keyword.value.trim()) return [];
  return concordance(text.value, keyword.value.trim(), {
    contextWords: contextWords.value,
    caseSensitive: caseSensitive.value,
  });
});
</script>

<template>
  <div class="kwic">
    <div class="toolbar">
      <input
        v-model="keyword"
        :placeholder="t('kw.placeholder')"
        @keyup.enter="keyword = keyword.trim()"
      />
      <label>
        {{ t("kw.context") }}
        <select v-model.number="contextWords">
          <option :value="4">4 {{ t("kw.wordsN") }}</option>
          <option :value="6">6 {{ t("kw.wordsN") }}</option>
          <option :value="10">10 {{ t("kw.wordsN") }}</option>
        </select>
      </label>
      <label class="check">
        <input v-model="caseSensitive" type="checkbox" />
        <span>{{ t("kw.case") }}</span>
      </label>
      <span v-if="keyword.trim()" class="tag">
        {{ lines.length }} {{ t("kw.occ") }}
      </span>
    </div>

    <div v-if="lines.length" class="lines">
      <div v-for="(l, i) in lines" :key="i" class="line">
        <span class="left">{{ l.left }}</span>
        <span class="kw">{{ l.keyword }}</span>
        <span class="right">{{ l.right }}</span>
      </div>
    </div>
    <p v-else-if="keyword.trim()" class="muted">{{ t("kw.none") }}</p>
    <p v-else class="muted">
      {{ t("kw.prompt") }}
    </p>
  </div>
</template>

<style scoped>
.kwic {
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
.lines {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.5rem 0;
  font-family: var(--mono);
  font-size: 0.83rem;
  max-height: 60vh;
  overflow: auto;
}
.line {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  padding: 0.3rem 1rem;
}
.line:hover {
  background: var(--surface-2);
}
.left {
  text-align: right;
  color: var(--text-dim);
}
.kw {
  color: var(--accent);
  font-weight: 700;
}
.right {
  color: var(--text-dim);
}
.muted {
  color: var(--text-dim);
  font-size: 0.85rem;
}
</style>
