<script setup>
import { ref, computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import { tokenizeWords } from "../../libs/text.js";

const { text } = useAnalysis();
const { t } = useI18n();

const copied = ref(false);
const wordCount = computed(() => tokenizeWords(text.value).length);

async function copy() {
  try {
    await navigator.clipboard.writeText(text.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    /* presse-papiers indisponible */
  }
}
</script>

<template>
  <div class="src">
    <div class="bar">
      <p class="intro">{{ t("src.intro") }}</p>
      <button class="btn" @click="copy">
        {{ copied ? t("src.copied") : t("src.copy") }}
      </button>
    </div>
    <div class="meta">
      {{ wordCount.toLocaleString() }} {{ t("src.words") }} ·
      {{ text.length.toLocaleString() }} {{ t("src.chars") }}
    </div>
    <pre class="text">{{ text }}</pre>
  </div>
</template>

<style scoped>
.src {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.intro {
  color: var(--text-dim);
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0;
}
.btn {
  flex-shrink: 0;
}
.btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.meta {
  font-size: 0.78rem;
  color: var(--text-dim);
}
.text {
  margin: 0;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
  font-family: var(--mono);
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 70vh;
  overflow: auto;
}
</style>
