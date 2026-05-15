<script setup>
import { computed } from "vue";

const props = defineProps({
  // [{ label, value }]
  data: { type: Array, default: () => [] },
  valueFormat: { type: Function, default: (v) => v },
});

const max = computed(() =>
  props.data.reduce((m, d) => Math.max(m, d.value), 0) || 1
);
</script>

<template>
  <div class="chart">
    <div v-if="!data.length" class="empty">Aucune donnée</div>
    <div v-for="(d, i) in data" :key="i" class="row">
      <span class="label" :title="d.label">{{ d.label }}</span>
      <span class="track">
        <span class="fill" :style="{ width: (d.value / max) * 100 + '%' }" />
      </span>
      <span class="value">{{ valueFormat(d.value) }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.row {
  display: grid;
  grid-template-columns: 140px 1fr 64px;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.82rem;
}
.label {
  font-family: var(--mono);
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.track {
  background: var(--surface-2);
  border-radius: 5px;
  height: 16px;
  overflow: hidden;
}
.fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), #ff9c45);
  border-radius: 5px;
  transition: width 0.3s ease;
}
.value {
  text-align: right;
  font-family: var(--mono);
  color: var(--text-dim);
}
.empty {
  color: var(--text-dim);
  font-size: 0.85rem;
  padding: 1rem 0;
}
@media (max-width: 560px) {
  .row {
    grid-template-columns: 84px 1fr 48px;
    gap: 0.4rem;
    font-size: 0.75rem;
  }
}
</style>
