// Détection automatique des locuteurs. Plusieurs stratégies, par ordre
// de fiabilité :
//   1. étiquettes en début de ligne   (chat / transcription / WhatsApp)
//   2. incises de dialogue nommées     (« …, dit Marie », "Bob said")
//   3. dialogue à tirets / guillemets  (locuteurs non nommés)
// L'objectif principal : répondre de façon robuste à
// « plusieurs personnes s'expriment-elles ? ».

import { tokenizeWords, tokenizeSentences } from "./text.js";
import { isStopword, detectLanguage } from "./stopwords.js";
import { analyzeSentiment } from "./sentiment.js";

const TIMESTAMP_RE =
  /^\s*(?:\[?\d{1,2}[/.]\d{1,2}[/.]\d{2,4}[,]?\s*)?\[?\d{1,2}:\d{2}(?::\d{2})?\]?\s*(?:[AP]M)?\s*[-–—]?\s*/i;

const SPEAKER_RE =
  /^\s*[>\[]?\s*([\p{L}\p{N}][\p{L}\p{N} ._'-]{0,38}?)\s*\]?\s*(?:\(\d{1,2}:\d{2}\))?\s*[:>]\s+(.+)$/u;

const VERBS =
  "dit|dis|dît|disait|répondit|répond|répondait|demanda|demande|demandait|" +
  "s['’]écria|écria|répliqua|murmura|chuchota|ajouta|reprit|lança|soupira|" +
  "expliqua|déclara|annonça|affirma|suggéra|proposa|interrogea|questionna|" +
  "rétorqua|objecta|conclut|poursuivit|continua|balbutia|bredouilla|hurla|" +
  "cria|gronda|songea|pensa|insista|admit|remarqua|observa|fit|" +
  "said|says|replied|asked|answered|shouted|whispered|added|continued|" +
  "exclaimed|muttered|murmured|declared|announced|suggested|wondered|cried|" +
  "yelled|responded|remarked|noted|observed|insisted|admitted|explained|" +
  "began|concluded|sighed|laughed";

const NAME = "\\p{Lu}[\\p{L}'’-]{1,20}";
const RE_TAG_AFTER = new RegExp(
  `(?:${VERBS})\\s+(?:l[ae] |d[’']\\s*)?(${NAME})`,
  "gu"
);
const RE_TAG_BEFORE = new RegExp(
  `(${NAME})\\s*[,—–-]?\\s+(?:${VERBS})\\b`,
  "gu"
);
const RE_DASH = /^\s*[—–―]\s+(.+)$|^\s*-\s+(.+)$/u;
const RE_QUOTE = /«\s*([^»]{1,400}?)\s*»|"([^"]{2,400}?)"|“([^”]{1,400}?)”/gu;

const NOT_NAME = new Set(
  `il elle ils elles je tu nous vous on le la les ce cet cette ces mais et
   puis alors donc or ni car lui leur son sa ses mon ma mes ton ta tes notre
   votre quand comme si pourtant cependant enfin ainsi soudain
   bonjour bonsoir salut hélas merci oui non ah oh eh bref voilà voila adieu
   pardon attention écoute ecoute tiens allez tout he she they we you i it
   the and but then so there here that this these those his her their our my
   your when while because hello hi yes no oh ah well okay thanks please`
    .split(/\s+/)
    .filter(Boolean)
);

function isName(raw) {
  const n = raw.trim();
  if (n.length < 2 || n.length > 22) return false;
  if (NOT_NAME.has(n.toLowerCase())) return false;
  return /^\p{Lu}/u.test(n);
}

function looksLikeName(label) {
  const l = label.trim();
  if (!l || l.length > 40) return false;
  if (l.split(/\s+/).length > 5) return false;
  if (/[.!?]$/.test(l)) return false;
  return /[\p{L}\p{N}]/u.test(l);
}

// Stratégie 1 : étiquettes « Nom : … » en début de ligne.
function fromLabels(text) {
  const lines = String(text).split(/\r?\n/);
  const turns = [];
  let current = null;
  for (const raw of lines) {
    const line = raw.replace(TIMESTAMP_RE, "");
    const m = line.match(SPEAKER_RE);
    if (m && looksLikeName(m[1])) {
      current = { speaker: m[1].trim(), text: m[2].trim() };
      turns.push(current);
    } else if (current && raw.trim()) {
      current.text += "\n" + raw.trim();
    }
  }
  const byName = new Map();
  for (const tr of turns) {
    const e = byName.get(tr.speaker) || { name: tr.speaker, text: "", turns: 0 };
    e.text += (e.text ? "\n" : "") + tr.text;
    e.turns += 1;
    byName.set(tr.speaker, e);
  }
  return { speakers: [...byName.values()], turns: turns.length };
}

function findNameIn(segment) {
  // En dialogue, l'incise suit presque toujours la réplique
  // (« …, dit Marie »), d'où la priorité à « verbe + Nom ».
  for (const re of [RE_TAG_AFTER, RE_TAG_BEFORE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(segment))) {
      if (isName(m[1])) return m[1].trim();
    }
  }
  return null;
}

function lastNameBefore(segment) {
  RE_TAG_BEFORE.lastIndex = 0;
  let m;
  let last = null;
  while ((m = RE_TAG_BEFORE.exec(segment))) {
    if (isName(m[1])) last = m[1].trim();
  }
  return last;
}

function firstNameAfter(segment) {
  RE_TAG_AFTER.lastIndex = 0;
  let m;
  while ((m = RE_TAG_AFTER.exec(segment))) {
    if (isName(m[1])) return m[1].trim();
  }
  return null;
}

const RE_STRIP = new RegExp(
  `\\s*[,—–-]?\\s*\\b(?:${VERBS})\\b\\s+(?:l[ae] |d[’']\\s*)?${NAME}[\\p{L}'’-]*` +
    `|\\b${NAME}[\\p{L}'’-]*\\s*,?\\s+\\b(?:${VERBS})\\b\\s*:?`,
  "giu"
);

// Retire l'incise de dialogue pour ne garder que la parole.
function stripTag(s) {
  return s.replace(RE_STRIP, " ").replace(/\s{2,}/g, " ").trim() || s;
}

// Locuteur d'une réplique : incise immédiatement adjacente.
function attribute(unit) {
  if (unit.kind === "dash") return findNameIn(unit.segment) || "?";
  return firstNameAfter(unit.after) || lastNameBefore(unit.before) || "?";
}

// Stratégie 2/3 : dialogue en prose (tirets, guillemets, incises).
function fromProse(text) {
  const lines = String(text).split(/\r?\n/);
  const units = [];

  for (const raw of lines) {
    const m = raw.match(RE_DASH);
    if (m) {
      const utt = (m[1] || m[2] || "").trim();
      if (tokenizeWords(utt).length >= 2)
        units.push({ kind: "dash", utterance: utt, segment: raw });
    }
  }

  let qm;
  RE_QUOTE.lastIndex = 0;
  while ((qm = RE_QUOTE.exec(text))) {
    const utt = (qm[1] || qm[2] || qm[3] || "").trim();
    if (tokenizeWords(utt).length < 2) continue;
    const end = qm.index + qm[0].length;
    units.push({
      kind: "quote",
      utterance: utt,
      before: text.slice(Math.max(0, qm.index - 60), qm.index),
      after: text.slice(end, end + 60),
    });
  }

  // Tous les noms cités via une incise de dialogue.
  const tagNames = new Set();
  for (const re of [RE_TAG_BEFORE, RE_TAG_AFTER]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      if (isName(m[1])) tagNames.add(m[1].trim());
    }
  }

  let speechHits = 0;
  const reCount = new RegExp(`\\b(?:${VERBS})\\b`, "giu");
  for (const _ of String(text).matchAll(reCount)) speechHits++;

  return { units, tagNames, speechHits };
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
  if (senti.label === "positif" && senti.mostPositive[0])
    return { tone: "positif", text: senti.mostPositive[0].text };
  if (senti.label === "négatif" && senti.mostNegative[0])
    return { tone: "négatif", text: senti.mostNegative[0].text };
  if (senti.mostPositive[0])
    return { tone: "positif", text: senti.mostPositive[0].text };
  if (senti.mostNegative[0])
    return { tone: "négatif", text: senti.mostNegative[0].text };
  return null;
}

// --- Corpus d'avis / forum (un auteur par avis) ---------------------

const RE_REVIEW_META =
  /^(?:détail|lire la suite|déposer un avis|trier par.*|visit[ée] en .*|avis déposé le.*|©.*|via google|note|\d+\s+avis|\d(?:[.,]\d)?\s*\/\s*5|partager|signaler|réponse de.*)$/i;

const RE_AVIS = /^\s*avis déposé le/gim;
const RE_VISITE = /^\s*visit[ée]\s+en\s+/gim;

function isHandle(s) {
  const v = s.trim();
  if (v.length < 2 || v.length > 40) return false;
  if (RE_REVIEW_META.test(v)) return false;
  if (/[!?,;:«»"]/.test(v)) return false;
  if (/[.][\s]/.test(v)) return false; // phrase (point + espace)
  if ((v.match(/\s/g) || []).length > 3) return false;
  return /^[\p{L}\p{N}][\p{L}\p{N} ._'-]*$/u.test(v);
}

function looksLikeReviews(text) {
  const avis = (text.match(RE_AVIS) || []).length;
  const visite = (text.match(RE_VISITE) || []).length;
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  let dup = 0;
  for (let i = 0; i + 1 < lines.length; i++) {
    if (lines[i] && lines[i] === lines[i + 1] && isHandle(lines[i])) dup++;
  }
  return avis >= 3 || dup >= 3 || (avis >= 2 && visite >= 2);
}

// 1 auteur = 1 avis. Le pseudo apparaît en double avant « Visité en… ».
function fromReviews(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const marks = [];
  for (let i = 0; i + 1 < lines.length; i++) {
    if (lines[i] && lines[i] === lines[i + 1] && isHandle(lines[i])) {
      marks.push({ name: lines[i], start: i + 2 });
    }
  }
  // Repli : si pas de pseudo dédoublé, découper sur « Avis déposé le ».
  if (marks.length < 2) {
    const reviews = text.split(/^\s*avis déposé le.*$/gim);
    const byName = new Map();
    let n = 0;
    for (const block of reviews) {
      const body = block
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !RE_REVIEW_META.test(l));
      if (body.length < 1) continue;
      const name = isHandle(body[0]) ? body[0] : `Avis ${++n}`;
      const content = body.slice(isHandle(body[0]) ? 1 : 0).join("\n");
      if (!content.trim()) continue;
      const e = byName.get(name) || { name, text: "", turns: 0 };
      e.text += (e.text ? "\n" : "") + content;
      e.turns += 1;
      byName.set(name, e);
    }
    return [...byName.values()];
  }

  const byName = new Map();
  marks.forEach((mk, idx) => {
    const end = idx + 1 < marks.length ? marks[idx + 1].start - 2 : lines.length;
    const body = [];
    for (let i = mk.start; i < end; i++) {
      const l = lines[i];
      if (!l) continue;
      if (l === mk.name) continue;
      if (RE_REVIEW_META.test(l)) continue;
      body.push(l);
    }
    const content = body.join("\n").trim();
    if (!content) return;
    const e = byName.get(mk.name) || { name: mk.name, text: "", turns: 0 };
    e.text += (e.text ? "\n" : "") + content;
    e.turns += 1;
    byName.set(mk.name, e);
  });
  return [...byName.values()];
}

// Construit la segmentation et le verdict « une / plusieurs personnes ».
export function segmentSpeakers(text) {
  if (looksLikeReviews(text)) {
    const reviewers = fromReviews(text);
    if (reviewers.length >= 2) {
      return {
        multi: true,
        basis: "reviews",
        speakers: reviewers,
        turnCount: reviewers.reduce((a, s) => a + s.turns, 0),
        named: true,
      };
    }
  }

  const labelled = fromLabels(text);
  if (labelled.speakers.length >= 2) {
    return {
      multi: true,
      basis: "labels",
      speakers: labelled.speakers,
      turnCount: labelled.turns,
      named: true,
    };
  }

  const { units, tagNames, speechHits } = fromProse(text);
  const dialogueTurns = units.length;

  const hasDialogue =
    tagNames.size >= 2 ||
    dialogueTurns >= 2 ||
    (tagNames.size >= 1 && speechHits >= 2) ||
    (dialogueTurns >= 1 && speechHits >= 2);

  if (!hasDialogue) {
    return {
      multi: false,
      basis: labelled.speakers.length === 1 ? "labels" : "none",
      speakers: labelled.speakers.length
        ? labelled.speakers
        : [{ name: "—", text: String(text), turns: 1 }],
      turnCount: labelled.turns || 1,
      named: labelled.speakers.length === 1,
    };
  }

  // Dialogue détecté : attribuer chaque réplique à un nom d'incise.
  if (tagNames.size >= 1) {
    const byName = new Map();
    for (const u of units) {
      const who = attribute(u);
      const e = byName.get(who) || { name: who, text: "", turns: 0 };
      e.text += (e.text ? "\n" : "") + stripTag(u.utterance);
      e.turns += 1;
      byName.set(who, e);
    }
    // Si aucune réplique n'a pu être rattachée, repli sur la liste de noms.
    let speakers = [...byName.values()].filter((s) => s.name !== "?" || s.turns);
    const named = speakers.filter((s) => s.name !== "?");
    if (named.length === 0) {
      speakers = [...tagNames].map((n) => ({ name: n, text: "", turns: 0 }));
    }
    return {
      multi: true,
      basis: "tags",
      speakers,
      turnCount: dialogueTurns || tagNames.size,
      named: true,
    };
  }

  // Dialogue sans noms : alternance supposée (2 voix).
  const v1 = { name: "Locuteur 1", text: "", turns: 0 };
  const v2 = { name: "Locuteur 2", text: "", turns: 0 };
  units.forEach((u, i) => {
    const v = i % 2 === 0 ? v1 : v2;
    v.text += (v.text ? "\n" : "") + stripTag(u.utterance);
    v.turns += 1;
  });
  return {
    multi: true,
    basis: "dash",
    speakers: [v1, v2].filter((v) => v.turns),
    turnCount: dialogueTurns,
    named: false,
  };
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
    const body = s.text || "";
    const senti = analyzeSentiment(body);
    return {
      name: s.name === "—" ? "Auteur" : s.name,
      turns: s.turns,
      words: tokenizeWords(body).length,
      mood: senti.label,
      positivity: senti.positivity,
      meanScore: senti.meanPerSentence,
      keywords: topKeywords(body, lang, names),
      highlight: representative(senti),
    };
  });

  const overallSenti = analyzeSentiment(text);

  return {
    multi: seg.multi,
    basis: seg.basis,
    named: seg.named,
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
