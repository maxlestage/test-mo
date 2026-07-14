<script setup>
import { useAnalysis } from "../../composables/useAnalysis.js";
import { useI18n } from "../../i18n/index.js";

const { speakers } = useAnalysis();
const { t } = useI18n();

const moodClass = (m) =>
  m === "positif" ? "level-easy" : m === "négatif" ? "level-hard" : "level-ok";
const moodLabel = (m) => t("mood." + m);

// Couleur pleine de la barre selon la positivité du locuteur.
const barColor = (p) =>
  p >= 55 ? "var(--ok)" : p <= 45 ? "var(--hard)" : "var(--warn)";

const basisKey = {
  labels: "sp.basisLabels",
  tags: "sp.basisTags",
  dash: "sp.basisDash",
  reviews: "sp.basisReviews",
  none: "sp.basisNone",
};

function displayName(name) {
  if (name === "Auteur") return t("sp.author");
  if (name === "?") return t("sp.unknown");
  const m = name.match(/^Locuteur (\d+)$/);
  if (m) return `${t("sp.voice")} ${m[1]}`;
  return name;
}
</script>

<template>
  <div class="spk">
    <p class="intro">{{ t("sp.intro") }}</p>

    <div class="verdict" :class="speakers.multi ? 'is-multi' : 'is-single'">
      <span class="vbadge">{{ speakers.multi ? "👥" : "👤" }}</span>
      <div>
        <strong>{{ speakers.multi ? t("sp.multiYes") : t("sp.multiNo") }}</strong>
        <span class="vbasis">{{ t(basisKey[speakers.basis] || "sp.basisNone") }}</span>
      </div>
    </div>

    <div class="overview">
      <div class="ov-head">
        <h3>{{ t("sp.idea") }}</h3>
        <span class="tag">
          {{
            speakers.multi
              ? `${speakers.speakerCount} ${t("sp.speakersN")} · ${speakers.turnCount} ${t("sp.turns")}`
              : t("sp.one")
          }}
        </span>
      </div>
      <div class="chips">
        <span v-for="k in speakers.overall.idea" :key="k.word" class="chip">
          {{ k.word }} <em>{{ k.count }}</em>
        </span>
        <span v-if="!speakers.overall.idea.length" class="dim">
          {{ t("sp.short") }}
        </span>
      </div>
      <p class="mood-line">
        {{ t("sp.moodAll") }} :
        <strong :class="moodClass(speakers.overall.mood)">
          {{ moodLabel(speakers.overall.mood) }}
        </strong>
        · {{ speakers.overall.positivity }}/100
      </p>
    </div>

    <div class="grid">
      <div v-for="s in speakers.speakers" :key="s.name" class="card">
        <div class="card-top">
          <span class="name">{{ displayName(s.name) }}</span>
          <span class="badge" :class="moodClass(s.mood)">
            {{ moodLabel(s.mood) }}
          </span>
        </div>
        <div class="meta">
          {{ s.turns }} {{ t("sp.intervN") }} · {{ s.words }} {{ t("sp.wordsN") }}
          <span v-if="s.rating != null" class="stars">· ★ {{ s.rating }}/5</span>
        </div>
        <div class="bar">
          <div
            class="bar-fill"
            :style="{ width: s.positivity + '%', background: barColor(s.positivity) }"
          />
        </div>
        <div class="cap">{{ s.positivity }}/100</div>

        <div class="kw">
          <span class="kw-label">{{ t("sp.kw") }}</span>
          <div class="chips">
            <span v-for="k in s.keywords.slice(0, 6)" :key="k.word" class="chip">
              {{ k.word }}
            </span>
            <span v-if="!s.keywords.length" class="dim">—</span>
          </div>
        </div>

        <blockquote v-if="s.highlight" :class="moodClass(s.mood)">
          « {{ s.highlight.text }} »
        </blockquote>

        <div v-if="s.text" class="full">
          <span class="full-label">{{ t("sp.fullReview") }}</span>
          <p class="full-text">{{ s.text }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.verdict {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1.1rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
  background: var(--surface);
}
.verdict.is-multi {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.verdict .vbadge {
  font-size: 1.5rem;
  line-height: 1;
}
.verdict strong {
  display: block;
  font-size: 1rem;
}
.verdict .vbasis {
  font-size: 0.8rem;
  color: var(--text-dim);
}
.spk {
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
.overview,
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
}
.ov-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.85rem;
  flex-wrap: wrap;
}
h3 {
  font-size: 0.98rem;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.chip {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.78rem;
  font-family: var(--mono);
}
.chip em {
  color: var(--text-dim);
  font-style: normal;
}
.mood-line {
  margin: 0.85rem 0 0;
  font-size: 0.85rem;
  color: var(--text-dim);
}
.mood-line strong {
  text-transform: capitalize;
}
.note {
  color: var(--text-dim);
  font-size: 0.83rem;
  line-height: 1.55;
  margin: 0;
  border-left: 3px solid var(--border);
  padding-left: 0.85rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.85rem;
}
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}
.name {
  font-size: 1.05rem;
  font-weight: 700;
  word-break: break-word;
}
.badge {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: capitalize;
}
.meta {
  font-size: 0.78rem;
  color: var(--text-dim);
  margin: 0.35rem 0 0.7rem;
}
.bar {
  height: 8px;
  border-radius: 999px;
  background: var(--surface-2);
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 999px;
  min-width: 8px;
  transition: width 0.3s ease;
}
.cap {
  font-size: 0.74rem;
  color: var(--text-dim);
  margin: 0.3rem 0 0.8rem;
}
.kw-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  display: block;
  margin-bottom: 0.4rem;
}
blockquote {
  margin: 0.85rem 0 0;
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--text);
  border-left: 3px solid var(--border);
  padding-left: 0.75rem;
}
blockquote.level-easy {
  border-left-color: var(--ok);
}
blockquote.level-hard {
  border-left-color: var(--hard);
}
blockquote.level-ok {
  border-left-color: var(--warn);
}
.stars {
  color: var(--accent);
  font-weight: 600;
}
.full {
  margin-top: 0.85rem;
}
.full-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-dim);
  display: block;
  margin-bottom: 0.35rem;
}
.full-text {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 180px;
  overflow-y: auto;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0.6rem 0.7rem;
}
.dim {
  color: var(--text-dim);
  font-size: 0.82rem;
}
code {
  font-family: var(--mono);
  background: var(--surface-2);
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
}
</style>
