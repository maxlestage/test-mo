<script setup>
import { computed } from "vue";
import { useAnalysis } from "../composables/useAnalysis.js";
import { useI18n } from "../i18n/index.js";
import { ngrams } from "../libs/linguistics.js";
import {
  fleschReadingEase,
  fleschKincaidGrade,
  kandelMoles,
  lix,
  interpretFlesch,
  interpretLix,
} from "../libs/readability.js";

const {
  document,
  stats,
  diversity,
  readability,
  sentiment,
  emotions,
  speakers,
  frequencies,
  words,
  lang,
} = useAnalysis();
const { t } = useI18n();

const date = computed(() =>
  new Date().toLocaleDateString(t("rp.dateLocale"), {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
);

const num = (v, d = 2) => (typeof v === "number" ? v.toFixed(d) : v);

function spkName(name) {
  if (name === "Auteur") return t("sp.author");
  if (name === "?") return t("sp.unknown");
  const m = name.match(/^Locuteur (\d+)$/);
  return m ? `${t("sp.voice")} ${m[1]}` : name;
}

const lvl = (level) =>
  level === "easy"
    ? t("rd.lvlEasy")
    : level === "hard"
    ? t("rd.lvlHard")
    : level === "ok"
    ? t("rd.lvlOk")
    : "—";

const general = computed(() => {
  const s = stats.value;
  return [
    [t("ov.words"), s.words],
    [t("ov.unique"), s.uniqueWords],
    [t("ov.sentences"), s.sentences],
    [t("ov.paragraphs"), s.paragraphs],
    [t("ov.chars"), s.characters],
    [t("rp.charsNs"), s.charactersNoSpaces],
    [t("rp.awl"), num(s.avgWordLength)],
    [t("ov.wps"), num(s.avgSentenceLength, 1)],
    [t("rp.reading"), `${Math.max(1, Math.round(s.readingTimeMin))} min`],
    [t("ov.longest"), s.longestWord || "—"],
  ];
});

const lexical = computed(() => {
  const d = diversity.value;
  return [
    [t("dv.ttr"), num(d.ttr, 4)],
    [t("dv.guiraud"), num(d.guiraud, 3)],
    [t("dv.cttr"), num(d.cttr, 3)],
    [t("dv.herdan"), num(d.herdanC, 4)],
    [t("dv.maas"), num(d.maas, 5)],
    [t("dv.hapax"), `${d.hapax} (${num(d.hapaxRatio * 100, 1)} %)`],
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
      lvl(interpretFlesch(km).level),
    ]);
  } else {
    const fre = fleschReadingEase(r);
    rows.push([
      "Flesch Reading Ease (EN)",
      fre == null ? "—" : num(fre, 1),
      lvl(interpretFlesch(fre).level),
    ]);
    const fk = fleschKincaidGrade(r);
    rows.push([
      "Flesch–Kincaid Grade",
      fk == null ? "—" : num(fk, 1),
      fk == null ? "—" : `${t("rd.grade")} ${Math.max(0, Math.round(fk))}`,
    ]);
  }
  const lx = lix(r);
  rows.push(["LIX", lx == null ? "—" : num(lx, 1), lvl(interpretLix(lx).level)]);
  return rows;
});

const senti = computed(() => {
  const s = sentiment.value;
  return [
    [t("st.global"), t("mood." + s.label)],
    [t("st.positivity"), `${s.positivity} / 100`],
    [t("st.mean"), num(s.meanPerSentence)],
    [
      t("st.dist"),
      `${s.counts.positif} ${t("st.pos")} · ${s.counts.neutre} ${t("st.neu")} · ${s.counts["négatif"]} ${t("st.neg")}`,
    ],
  ];
});

const emo = computed(() => {
  const e = emotions.value;
  const top = e.distribution
    .filter((d) => d.score > 0)
    .slice(0, 3)
    .map((d) => `${t("emo." + d.emotion)} ${(d.share * 100).toFixed(0)} %`)
    .join(" · ");
  return [
    [t("em.dominant"), e.dominant ? t("emo." + e.dominant) : t("em.none")],
    [
      t("em.sensIndex"),
      `${e.sensitivity.index} / 100 (${t("em.lvl." + e.sensitivity.label)})`,
    ],
    [t("st.emo"), e.emotionalWords],
    [t("em.dist"), top || "—"],
  ];
});

const topWords = computed(() => frequencies.value.slice(0, 20));
const topBigrams = computed(() =>
  ngrams(words.value, 2, { lang: lang.value, removeStopwords: true }).slice(0, 12)
);
const spk = computed(() => speakers.value);
</script>

<template>
  <div class="print-report">
    <header>
      <h1>{{ t("rp.title") }}</h1>
      <p class="meta">
        {{ t("rp.document") }} : <strong>{{ document?.name || "—" }}</strong> ·
        {{ t("ov.lang") }} : {{ lang === "fr" ? t("mgr.fr") : t("mgr.en") }} ·
        {{ t("rp.edited") }} {{ date }}
      </p>
    </header>

    <section>
      <h2>{{ t("rp.s1") }}</h2>
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
      <h2>{{ t("rp.s2") }}</h2>
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
      <h2>{{ t("rp.s3") }}</h2>
      <table>
        <thead>
          <tr>
            <th>{{ t("rp.colIndex") }}</th>
            <th>{{ t("rp.colScore") }}</th>
            <th>{{ t("rp.colInterp") }}</th>
          </tr>
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
      <h2>{{ t("rp.s4") }}</h2>
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
      <h2>{{ t("rp.sEmotions") }}</h2>
      <table>
        <tbody>
          <tr v-for="[k, v] in emo" :key="k">
            <td>{{ k }}</td>
            <td class="v">{{ v }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2>{{ t("rp.s5") }}</h2>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>{{ t("fq.word") }}</th>
            <th>{{ t("fq.occ") }}</th>
            <th>{{ t("fq.freq") }}</th>
          </tr>
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
      <h2>{{ t("rp.s6") }}</h2>
      <table>
        <thead>
          <tr><th>{{ t("ng.bigram") }}</th><th>{{ t("fq.occ") }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="g in topBigrams" :key="g.gram">
            <td>{{ g.gram }}</td>
            <td class="v">{{ g.count }}</td>
          </tr>
          <tr v-if="!topBigrams.length">
            <td colspan="2">{{ t("ng.short") }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="spk.multi">
      <h2>{{ t("rp.s7") }}</h2>
      <p class="sub">
        {{ t("sp.multiYes") }} — {{ spk.speakerCount }} {{ t("sp.speakersN") }} ·
        {{ spk.turnCount }} {{ t("sp.turns") }} ·
        {{ t("sp.moodAll") }} : {{ t("mood." + spk.overall.mood) }}
      </p>
      <table>
        <thead>
          <tr>
            <th>{{ t("rp.spkName") }}</th>
            <th>{{ t("sp.turns") }}</th>
            <th>{{ t("rp.mood") }}</th>
            <th>{{ t("rp.positivity") }}</th>
            <th>{{ t("sp.kw") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in spk.speakers" :key="s.name">
            <td>{{ spkName(s.name) }}</td>
            <td class="v">{{ s.turns }}</td>
            <td>{{ t("mood." + s.mood) }}</td>
            <td class="v">{{ s.positivity }} / 100</td>
            <td>{{ s.keywords.slice(0, 5).map((k) => k.word).join(", ") }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <footer>{{ t("rp.footer") }}</footer>
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
.sub {
  margin: 0 0 8px;
  font-size: 11px;
  color: #444;
}
footer {
  margin-top: 24px;
  padding-top: 10px;
  border-top: 1px solid #999;
  font-size: 10px;
  color: #555;
}
</style>
