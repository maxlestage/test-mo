<script setup>
import { computed, ref } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import { progression } from "../../libs/textometry.js";
import BarChart from "../BarChart.vue";

const { text } = useAnalysis();
const { t } = useI18n();

const keyword = ref("");
const bins = ref(20);
const caseSensitive = ref(false);

const result = computed(() =>
  progression(text.value, keyword.value.trim(), {
    bins: bins.value,
    caseSensitive: caseSensitive.value,
  })
);

const chartData = computed(() =>
  result.value.buckets.map((b, i) => ({
    label: `${Math.round(b.from * 100)}–${Math.round(b.to * 100)} %`,
    value: b.count,
  }))
);

const showPrompt = computed(() => !keyword.value.trim());
const showNotFound = computed(
  () => !showPrompt.value && result.value.total === 0
);
</script>

<template>
  <div class="prog">
    <p class="intro">{{ t("pg.intro") }}</p>

    <div class="toolbar">
      <input v-model="keyword" :placeholder="t('pg.placeholder')" />
      <label>
        {{ t("pg.bins") }}
        <select v-model.number="bins">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="40">40</option>
        </select>
      </label>
      <label class="check">
        <input v-model="caseSensitive" type="checkbox" />
        <span>{{ t("pg.case") }}</span>
      </label>
      <span v-if="result.total" class="tag">
        {{ result.total }} {{ t("pg.occurrences") }}
        {{ t("pg.over") }} {{ result.tokenCount.toLocaleString() }}
        {{ t("pg.tokens") }}
      </span>
    </div>

    <p v-if="showPrompt" class="muted">{{ t("pg.empty") }}</p>
    <p v-else-if="showNotFound" class="muted">{{ t("pg.notFound") }}</p>

    <template v-else>
      <div class="bar">
        <span
          v-for="(o, i) in result.occurrences"
          :key="i"
          class="tick"
          :style="{ left: o.position * 100 + '%' }"
        />
      </div>
      <div class="block">
        <BarChart :data="chartData" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.prog {
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
.bar {
  position: relative;
  height: 38px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.tick {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--accent);
  border-radius: 2px;
  transform: translateX(-1px);
}
.block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
}
</style>
