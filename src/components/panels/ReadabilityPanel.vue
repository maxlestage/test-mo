<script setup>
import { computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";
import {
  fleschReadingEase,
  fleschKincaidGrade,
  kandelMoles,
  lix,
  interpretFlesch,
  interpretLix,
} from "../../libs/readability.js";

const { readability, lang } = useAnalysis();
const { t } = useI18n();

const lvl = (level) =>
  level === "easy"
    ? t("rd.lvlEasy")
    : level === "hard"
    ? t("rd.lvlHard")
    : level === "ok"
    ? t("rd.lvlOk")
    : "—";

const scores = computed(() => {
  const r = readability.value;
  const out = [];

  if (lang.value === "fr") {
    const km = kandelMoles(r);
    const it = interpretFlesch(km);
    out.push({
      name: "Flesch — Kandel & Moles (FR)",
      score: km == null ? "—" : km.toFixed(1),
      label: lvl(it.level),
      level: it.level,
      hint: t("rd.hKm"),
    });
  } else {
    const fre = fleschReadingEase(r);
    const it = interpretFlesch(fre);
    out.push({
      name: "Flesch Reading Ease (EN)",
      score: fre == null ? "—" : fre.toFixed(1),
      label: lvl(it.level),
      level: it.level,
      hint: t("rd.hFre"),
    });
    const fk = fleschKincaidGrade(r);
    out.push({
      name: "Flesch–Kincaid Grade",
      score: fk == null ? "—" : fk.toFixed(1),
      label: fk == null ? "—" : `${t("rd.grade")} ${Math.max(0, Math.round(fk))}`,
      level: "ok",
      hint: t("rd.hFk"),
    });
  }

  const lx = lix(r);
  const il = interpretLix(lx);
  out.push({
    name: "LIX",
    score: lx == null ? "—" : lx.toFixed(1),
    label: lvl(il.level),
    level: il.level,
    hint: t("rd.hLix"),
  });

  return out;
});
</script>

<template>
  <div class="read">
    <div class="stats">
      <span class="tag">{{ readability.words }} {{ t("rd.words") }}</span>
      <span class="tag">{{ readability.sentences }} {{ t("rd.sentences") }}</span>
      <span class="tag">{{ readability.syllables }} {{ t("rd.syll") }}</span>
      <span class="tag">{{ readability.longWords }} {{ t("rd.long") }}</span>
    </div>
    <div class="list">
      <div v-for="s in scores" :key="s.name" class="score">
        <div class="top">
          <span class="name">{{ s.name }}</span>
          <span class="num">{{ s.score }}</span>
        </div>
        <span class="badge" :class="'level-' + s.level">{{ s.label }}</span>
        <p class="hint">{{ s.hint }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.read {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.stats {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.85rem;
}
.score {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.name {
  font-size: 0.85rem;
  font-weight: 600;
}
.num {
  font-family: var(--mono);
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--accent);
}
.badge {
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
}
.hint {
  margin: 0;
  font-size: 0.77rem;
  color: var(--text-dim);
  line-height: 1.5;
}
</style>
