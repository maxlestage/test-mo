<script setup>
import { computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";

const { speakers } = useAnalysis();

const moodClass = (m) =>
  m === "positif" ? "level-easy" : m === "négatif" ? "level-hard" : "level-ok";
</script>

<template>
  <div class="spk">
    <p class="intro">
      Détection automatique des intervenants (formats chat, transcription,
      interview, export WhatsApp…). Pour chaque personne : son humeur, ses
      mots-clés et un extrait représentatif. Analyse 100 % locale.
    </p>

    <div class="overview">
      <div class="ov-head">
        <h3>Idée générale</h3>
        <span class="tag">
          {{
            speakers.multi
              ? `${speakers.speakerCount} locuteurs · ${speakers.turnCount} interventions`
              : "Un seul locuteur détecté"
          }}
        </span>
      </div>
      <div class="chips">
        <span v-for="k in speakers.overall.idea" :key="k.word" class="chip">
          {{ k.word }} <em>{{ k.count }}</em>
        </span>
        <span v-if="!speakers.overall.idea.length" class="dim">
          Texte trop court.
        </span>
      </div>
      <p class="mood-line">
        Humeur d'ensemble :
        <strong :class="moodClass(speakers.overall.mood)">
          {{ speakers.overall.mood }}
        </strong>
        · positivité {{ speakers.overall.positivity }}/100
      </p>
    </div>

    <p v-if="!speakers.multi" class="note">
      Aucun marqueur de dialogue (« Nom : … ») n'a été trouvé : le texte est
      traité comme un seul auteur. Pour une analyse par personne, utilisez un
      format du type <code>Alice : message</code> (chat, transcription,
      interview, export de messagerie).
    </p>

    <div class="grid">
      <div v-for="s in speakers.speakers" :key="s.name" class="card">
        <div class="card-top">
          <span class="name">{{ s.name }}</span>
          <span class="badge" :class="moodClass(s.mood)">{{ s.mood }}</span>
        </div>
        <div class="meta">
          {{ s.turns }} intervention(s) · {{ s.words }} mots
        </div>
        <div class="bar">
          <div class="bar-fill" :style="{ width: s.positivity + '%' }" />
        </div>
        <div class="cap">Positivité {{ s.positivity }}/100</div>

        <div class="kw">
          <span class="kw-label">Mots-clés</span>
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
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  background: linear-gradient(90deg, var(--hard), var(--warn), var(--ok));
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
