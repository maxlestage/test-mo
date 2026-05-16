<script setup>
import { computed } from "vue";
import { useAnalysis } from "../composables/useAnalysis.js";
import { ngrams } from "../libs/linguistics.js";
import {
  fleschReadingEase,
  fleschKincaidGrade,
  kandelMoles,
  lix,
  interpretFlesch,
  interpretLix,
} from "../libs/readability.js";

const { document, stats, diversity, readability, sentiment, frequencies, words, lang } =
  useAnalysis();

const date = new Date().toLocaleDateString("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const num = (v, d = 2) =>
  typeof v === "number" ? v.toFixed(d) : v;

const general = computed(() => {
  const s = stats.value;
  return [
    ["Mots", s.words],
    ["Mots uniques", s.uniqueWords],
    ["Phrases", s.sentences],
    ["Paragraphes", s.paragraphs],
    ["Caractères", s.characters],
    ["Caractères (sans espaces)", s.charactersNoSpaces],
    ["Longueur moyenne d'un mot", num(s.avgWordLength)],
    ["Mots par phrase", num(s.avgSentenceLength, 1)],
    ["Temps de lecture estimé", `${Math.max(1, Math.round(s.readingTimeMin))} min`],
    ["Mot le plus long", s.longestWord || "—"],
  ];
});

const lexical = computed(() => {
  const d = diversity.value;
  return [
    ["Type-Token Ratio (TTR)", num(d.ttr, 4)],
    ["Indice de Guiraud", num(d.guiraud, 3)],
    ["CTTR (corrigé)", num(d.cttr, 3)],
    ["Constante C de Herdan", num(d.herdanC, 4)],
    ["Indice a² de Maas", num(d.maas, 5)],
    ["Hapax legomena", `${d.hapax} (${num(d.hapaxRatio * 100, 1)} %)`],
  ];
});

const readScores = computed(() => {
  const r = readability.value;
  const rows = [];
  if (lang.value === "fr") {
    const km = kandelMoles(r);
    rows.push([
      "Flesch — Kandel & Moles (FR)",
      km == null ? "—" : num(km, 1),
      interpretFlesch(km).label,
    ]);
  } else {
    const fre = fleschReadingEase(r);
    rows.push([
      "Flesch Reading Ease (EN)",
      fre == null ? "—" : num(fre, 1),
      interpretFlesch(fre).label,
    ]);
    const fk = fleschKincaidGrade(r);
    rows.push([
      "Flesch–Kincaid Grade",
      fk == null ? "—" : num(fk, 1),
      fk == null ? "—" : `Niveau ≈ ${Math.max(0, Math.round(fk))}`,
    ]);
  }
  const lx = lix(r);
  rows.push(["LIX", lx == null ? "—" : num(lx, 1), interpretLix(lx).label]);
  return rows;
});

const senti = computed(() => {
  const s = sentiment.value;
  return [
    ["Tonalité globale", s.label],
    ["Indice de positivité", `${s.positivity} / 100`],
    ["Score moyen par phrase", num(s.meanPerSentence)],
    [
      "Répartition des phrases",
      `${s.counts.positif} positives · ${s.counts.neutre} neutres · ${s.counts["négatif"]} négatives`,
    ],
  ];
});

const topWords = computed(() => frequencies.value.slice(0, 20));
const topBigrams = computed(() =>
  ngrams(words.value, 2, { lang: lang.value, removeStopwords: true }).slice(0, 12)
);
</script>

<template>
  <div class="print-report">
    <header>
      <h1>Mo-Grid — Rapport d'analyse linguistique</h1>
      <p class="meta">
        Document : <strong>{{ document?.name || "—" }}</strong> ·
        Langue : {{ lang === "fr" ? "français" : "anglais" }} ·
        Édité le {{ date }}
      </p>
    </header>

    <section>
      <h2>1. Statistiques générales</h2>
      <table>
        <tbody>
          <tr v-for="[k, v] in general" :key="k">
            <td>{{ k }}</td>
            <td class="v">{{ v }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>2. Richesse lexicale</h2>
      <table>
        <tbody>
          <tr v-for="[k, v] in lexical" :key="k">
            <td>{{ k }}</td>
            <td class="v">{{ v }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>3. Lisibilité</h2>
      <table>
        <thead>
          <tr><th>Indice</th><th>Score</th><th>Interprétation</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in readScores" :key="row[0]">
            <td>{{ row[0] }}</td>
            <td class="v">{{ row[1] }}</td>
            <td>{{ row[2] }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>4. Analyse de sentiment</h2>
      <table>
        <tbody>
          <tr v-for="[k, v] in senti" :key="k">
            <td>{{ k }}</td>
            <td class="v">{{ v }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>5. Mots les plus fréquents</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Mot</th><th>Occurrences</th><th>Fréquence</th></tr>
        </thead>
        <tbody>
          <tr v-for="(f, i) in topWords" :key="f.word">
            <td>{{ i + 1 }}</td>
            <td>{{ f.word }}</td>
            <td class="v">{{ f.count }}</td>
            <td class="v">{{ (f.ratio * 100).toFixed(2) }} %</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>6. Bigrammes marquants</h2>
      <table>
        <thead>
          <tr><th>Bigramme</th><th>Occurrences</th></tr>
        </thead>
        <tbody>
          <tr v-for="g in topBigrams" :key="g.gram">
            <td>{{ g.gram }}</td>
            <td class="v">{{ g.count }}</td>
          </tr>
          <tr v-if="!topBigrams.length">
            <td colspan="2">Texte trop court.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <footer>
      Généré localement par Mo-Grid — aucune donnée n'a été transmise sur le
      réseau. Méthodes : tokenisation Unicode, indices lexicaux standard,
      lisibilité (Flesch / Kandel & Moles / LIX), sentiment lexical FR/EN.
    </footer>
  </div>
</template>

<style scoped>
.print-report {
  color: #111;
  background: #fff;
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 12px;
  line-height: 1.5;
  padding: 0;
}
header {
  border-bottom: 2px solid #111;
  padding-bottom: 10px;
  margin-bottom: 18px;
}
h1 {
  font-size: 20px;
  margin: 0 0 6px;
}
.meta {
  margin: 0;
  font-size: 11px;
  color: #444;
}
section {
  margin-bottom: 18px;
  break-inside: avoid;
}
h2 {
  font-size: 14px;
  margin: 0 0 8px;
  border-left: 4px solid #111;
  padding-left: 8px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: 4px 8px;
  border-bottom: 1px solid #ccc;
  font-size: 11.5px;
}
th {
  background: #f0f0f0;
  border-bottom: 1px solid #999;
}
td.v {
  font-family: "Courier New", monospace;
  text-align: right;
  white-space: nowrap;
}
footer {
  margin-top: 24px;
  padding-top: 10px;
  border-top: 1px solid #999;
  font-size: 10px;
  color: #555;
}
</style>
