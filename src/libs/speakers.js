// Détection automatique des locuteurs dans un texte (chat, transcription,
// interview, commentaires) puis analyse par personne : idée générale,
// humeur (sentiment) et mots caractéristiques.

import { tokenizeWords, tokenizeSentences } from "./text.js";
import { isStopword, detectLanguage } from "./stopwords.js";
import { analyzeSentiment } from "./sentiment.js";

// Préfixes de locuteur en début de ligne. On retire d'abord un
// éventuel horodatage (WhatsApp, transcription, IRC…).
const TIMESTAMP_RE =
  /^\s*(?:\[?\d{1,2}[/.]\d{1,2}[/.]\d{2,4}[,]?\s*)?\[?\d{1,2}:\d{2}(?::\d{2})?\]?\s*(?:[AP]M)?\s*[-–—]?\s*/i;

const SPEAKER_RE =
  /^\s*[>\[]?\s*([\p{L}\p{N}][\p{L}\p{N} ._'-]{0,38}?)\s*\]?\s*(?:\(\d{1,2}:\d{2}\))?\s*[:>]\s+(.+)$/u;

function looksLikeName(label) {
  const l = label.trim();
  if (!l || l.length > 40) return false;
  if (l.split(/\s+/).length > 5) return false;
  if (/[.!?]$/.test(l)) return false;
  return /[\p{L}\p{N}]/u.test(l);
}

export function segmentSpeakers(text) {
  const lines = String(text).split(/\r?\n/);
  const turns = [];
  let current = null;

  for (const raw of lines) {
    const line = raw.replace(TIMESTAMP_RE, "");
    const m = line.match(SPEAKER_RE);
    if (m && looksLikeName(m[1])) {
      const name = m[1].trim();
      current = { speaker: name, text: m[2].trim() };
      turns.push(current);
    } else if (current && raw.trim()) {
      current.text += "\n" + raw.trim();
    } else if (raw.trim()) {
      // Texte avant tout locuteur identifié : narrateur / auteur unique.
      if (!current || current.speaker !== "—") {
        current = { speaker: "—", text: raw.trim() };
        turns.push(current);
      } else {
        current.text += "\n" + raw.trim();
      }
    }
  }

  const byName = new Map();
  for (const t of turns) {
    const e = byName.get(t.speaker) || { name: t.speaker, text: "", turns: 0 };
    e.text += (e.text ? "\n" : "") + t.text;
    e.turns += 1;
    byName.set(t.speaker, e);
  }

  const named = [...byName.values()].filter((s) => s.name !== "—");
  const multi = named.length >= 2;

  const speakers = (multi ? named : [...byName.values()]).sort(
    (a, b) => b.turns - a.turns
  );

  return { multi, speakers, turnCount: turns.length };
}

function topKeywords(text, lang, exclude = new Set()) {
  const counts = new Map();
  for (const w of tokenizeWords(text)) {
    if (w.length < 3 || isStopword(w, lang) || exclude.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 8);
}

function representative(senti) {
  if (senti.mostPositive[0] && senti.label === "positif")
    return { tone: "positif", text: senti.mostPositive[0].text };
  if (senti.mostNegative[0] && senti.label === "négatif")
    return { tone: "négatif", text: senti.mostNegative[0].text };
  if (senti.mostPositive[0])
    return { tone: "positif", text: senti.mostPositive[0].text };
  if (senti.mostNegative[0])
    return { tone: "négatif", text: senti.mostNegative[0].text };
  return null;
}

export function analyzeSpeakers(text) {
  const seg = segmentSpeakers(text);
  const lang = detectLanguage(tokenizeWords(text).slice(0, 800));
  const names = new Set(
    seg.speakers.flatMap((s) =>
      tokenizeWords(s.name).map((w) => w.toLowerCase())
    )
  );

  const perSpeaker = seg.speakers.map((s) => {
    const senti = analyzeSentiment(s.text);
    return {
      name: s.name === "—" ? "Auteur" : s.name,
      turns: s.turns,
      words: tokenizeWords(s.text).length,
      mood: senti.label,
      positivity: senti.positivity,
      meanScore: senti.meanPerSentence,
      keywords: topKeywords(s.text, lang, names),
      highlight: representative(senti),
    };
  });

  const overallSenti = analyzeSentiment(text);

  return {
    multi: seg.multi,
    speakerCount: seg.speakers.filter((s) => s.name !== "—").length,
    turnCount: seg.turnCount,
    lang,
    overall: {
      idea: topKeywords(text, lang, names),
      mood: overallSenti.label,
      positivity: overallSenti.positivity,
    },
    speakers: perSpeaker,
  };
}
