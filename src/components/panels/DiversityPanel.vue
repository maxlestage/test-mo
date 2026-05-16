<script setup>
import { computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";

const { diversity } = useAnalysis();
const { t } = useI18n();

const metrics = computed(() => {
  const d = diversity.value;
  return [
    { name: t("dv.tokens"), value: `${d.tokens} / ${d.types}`, hint: t("dv.hTokens") },
    { name: t("dv.ttr"), value: d.ttr.toFixed(4), hint: t("dv.hTtr") },
    { name: t("dv.guiraud"), value: d.guiraud.toFixed(3), hint: t("dv.hGuiraud") },
    { name: t("dv.cttr"), value: d.cttr.toFixed(3), hint: t("dv.hCttr") },
    { name: t("dv.herdan"), value: d.herdanC.toFixed(4), hint: t("dv.hHerdan") },
    { name: t("dv.maas"), value: d.maas.toFixed(5), hint: t("dv.hMaas") },
    {
      name: t("dv.hapax"),
      value: `${d.hapax} (${(d.hapaxRatio * 100).toFixed(1)} %)`,
      hint: t("dv.hHapax"),
    },
  ];
});
</script>

<template>
  <div class="diversity">
    <p class="intro">{{ t("dv.intro") }}</p>
    <div class="list">
      <div v-for="m in metrics" :key="m.name" class="metric">
        <div class="head">
          <span class="name">{{ m.name }}</span>
          <span class="value">{{ m.value }}</span>
        </div>
        <p class="hint">{{ m.hint }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diversity {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.intro {
  color: var(--text-dim);
  font-size: 0.88rem;
  max-width: 70ch;
  line-height: 1.55;
}
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.85rem;
}
.metric {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.name {
  font-size: 0.88rem;
  font-weight: 600;
}
.value {
  font-family: var(--mono);
  font-size: 1.05rem;
  color: var(--accent);
  font-weight: 700;
}
.hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-dim);
  line-height: 1.5;
}
</style>
