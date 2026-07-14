<script setup>
import { computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import { EMOTIONS } from "../../libs/emotions.js";

const { emotions } = useAnalysis();
const { t } = useI18n();

const COLORS = {
  joie: "#f2b705",
  tristesse: "#5b8dd9",
  colère: "#e05252",
  peur: "#9b6dd6",
  surprise: "#3fbdd8",
  dégoût: "#8aab4c",
  confiance: "#3fae7f",
  anticipation: "#ef8f3e",
};

const maxShare = computed(() =>
  emotions.value.distribution.reduce((m, d) => Math.max(m, d.share), 0) || 1
);

const sensLabel = computed(
  () => t("em.lvl." + emotions.value.sensitivity.label)
);

const sensClass = computed(() => {
  const i = emotions.value.sensitivity.index;
  return i < 25 ? "level-easy" : i < 60 ? "level-ok" : "level-hard";
});

// Couleur pleine de la jauge selon le niveau de sensibilité.
const gaugeColor = computed(() => {
  const i = emotions.value.sensitivity.index;
  return i < 25 ? "var(--ok)" : i < 60 ? "var(--warn)" : "var(--hard)";
});

const activeEmotions = computed(() =>
  EMOTIONS.filter((e) => emotions.value.topWords[e].length)
);

const pct = (v) => (v * 100).toFixed(1) + " %";
</script>

<template>
  <div class="emo">
    <p class="intro">{{ t("em.intro") }}</p>

    <div class="top">
      <div class="verdict">
        <span class="kicker">{{ t("em.sensitivity") }}</span>
        <span class="label" :class="sensClass">{{ sensLabel }}</span>
        <div class="gauge">
          <div
            class="gauge-fill"
            :style="{
              width: emotions.sensitivity.index + '%',
              background: gaugeColor,
            }"
          />
        </div>
        <span class="gauge-cap">
          {{ t("em.sensIndex") }} :
          <strong>{{ emotions.sensitivity.index }}/100</strong>
        </span>
      </div>

      <div class="verdict">
        <span class="kicker">{{ t("em.dominant") }}</span>
        <span
          v-if="emotions.dominant"
          class="label"
          :style="{ color: COLORS[emotions.dominant] }"
        >
          {{ t("emo." + emotions.dominant) }}
        </span>
        <span v-else class="label dim">{{ t("em.none") }}</span>
        <span class="gauge-cap">
          {{ emotions.emotionalWords }} {{ t("em.words") }} ·
          {{ emotions.emotionalSentences }}/{{ emotions.sentenceCount }}
          {{ t("em.sentencesShort") }}
        </span>
      </div>

      <div class="mini">
        <div class="stat">
          <span class="num">{{ pct(emotions.sensitivity.density) }}</span>
          <span class="cap">{{ t("em.density") }}</span>
        </div>
        <div class="stat">
          <span class="num">{{ pct(emotions.sensitivity.coverage) }}</span>
          <span class="cap">{{ t("em.coverage") }}</span>
        </div>
        <div class="stat">
          <span class="num">{{ emotions.sensitivity.intensity.toFixed(2) }}</span>
          <span class="cap">{{ t("em.intensity") }}</span>
        </div>
      </div>
    </div>

    <div class="block">
      <h3>{{ t("em.dist") }}</h3>
      <div class="chart">
        <div v-for="d in emotions.distribution" :key="d.emotion" class="row">
          <span class="rlabel">
            <span class="dot" :style="{ background: COLORS[d.emotion] }" />
            {{ t("emo." + d.emotion) }}
          </span>
          <span class="track">
            <span
              class="fill"
              :style="{
                width: (d.share / maxShare) * 100 + '%',
                background: COLORS[d.emotion],
              }"
            />
          </span>
          <span class="value">{{ pct(d.share) }}</span>
        </div>
      </div>
    </div>

    <div v-if="activeEmotions.length" class="block">
      <h3>{{ t("em.topWords") }}</h3>
      <div class="emo-words">
        <section v-for="e in activeEmotions" :key="e" class="emo-col">
          <h4 :style="{ color: COLORS[e] }">{{ t("emo." + e) }}</h4>
          <ul>
            <li v-for="w in emotions.topWords[e]" :key="w.word">
              <span class="mono">{{ w.word }}</span>
              <span class="dim">×{{ w.count }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div class="block">
      <h3>{{ t("em.sentences") }}</h3>
      <p
        v-for="(s, i) in emotions.mostSensitive"
        :key="i"
        class="quote"
        :style="{ borderLeftColor: s.dominant ? COLORS[s.dominant] : 'var(--border)' }"
      >
        <span
          v-if="s.dominant"
          class="badge"
          :style="{ color: COLORS[s.dominant] }"
        >
          {{ t("emo." + s.dominant) }} · {{ s.weight.toFixed(1) }}
        </span>
        {{ s.text }}
      </p>
      <p v-if="!emotions.mostSensitive.length" class="dim">
        {{ t("em.noneFound") }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.emo {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.intro {
  color: var(--text-dim);
  font-size: 0.88rem;
  max-width: 75ch;
  line-height: 1.55;
  margin: 0;
}
.top {
  display: grid;
  grid-template-columns: 1.1fr 1.1fr 1.4fr;
  gap: 1rem;
}
.verdict,
.block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
}
.verdict {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.kicker {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
}
.label {
  font-size: 1.5rem;
  font-weight: 800;
  text-transform: capitalize;
}
.gauge {
  height: 10px;
  border-radius: 999px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}
.gauge-fill {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 999px;
  min-width: 10px;
  transition: width 0.3s ease, background 0.3s ease;
}
.gauge-cap {
  font-size: 0.8rem;
  color: var(--text-dim);
}
.mini {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}
.stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  justify-content: center;
}
.num {
  font-family: var(--mono);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent);
}
.cap {
  font-size: 0.76rem;
  color: var(--text-dim);
}
.block h3 {
  font-size: 0.95rem;
  margin-bottom: 1rem;
}
.chart {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.row {
  display: grid;
  grid-template-columns: 150px 1fr 72px;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.82rem;
}
.rlabel {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: capitalize;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.track {
  background: var(--surface-2);
  border-radius: 5px;
  height: 14px;
  overflow: hidden;
}
.fill {
  display: block;
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
}
.value {
  text-align: right;
  font-family: var(--mono);
  color: var(--text-dim);
}
.emo-words {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1rem;
}
.emo-col h4 {
  font-size: 0.82rem;
  margin: 0 0 0.5rem;
  text-transform: capitalize;
}
.emo-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.82rem;
}
.emo-col li {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}
.mono {
  font-family: var(--mono);
}
.dim {
  color: var(--text-dim);
}
.quote {
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0 0 0.7rem;
  padding-left: 0.75rem;
  border-left: 3px solid var(--border);
}
.badge {
  font-family: var(--mono);
  font-size: 0.75rem;
  font-weight: 700;
  margin-right: 0.4rem;
  text-transform: capitalize;
}
@media (max-width: 860px) {
  .top {
    grid-template-columns: 1fr;
  }
  .row {
    grid-template-columns: 100px 1fr 60px;
    gap: 0.4rem;
    font-size: 0.75rem;
  }
}
</style>
