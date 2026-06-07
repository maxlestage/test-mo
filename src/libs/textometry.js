// Mesures textométriques inspirées de TXM (Lyon/Huma-Num) :
// spécificités via test du rapport de vraisemblance (G²) et
// progression d'un mot-clé sur la longueur du texte.

import { tokenizeWords } from "./text.js";
import { isStopword } from "./stopwords.js";

function lnSafe(x) {
  return x > 0 ? Math.log(x) : 0;
}

// Test G² (log-likelihood ratio) signé sur un tableau 2×2.
// Signe positif → sur-représentation, négatif → sous-représentation.
function signedG2(a, b, c, d) {
  const row1 = a + b;
  const row2 = c + d;
  const col1 = a + c;
  const col2 = b + d;
  const N = a + b + c + d;
  if (!N || !row1 || !row2 || !col1 || !col2) return 0;
  const eA = (row1 * col1) / N;
  const eB = (row1 * col2) / N;
  const eC = (row2 * col1) / N;
  const eD = (row2 * col2) / N;
  const g2 =
    2 *
    (a * lnSafe(a / eA) +
      b * lnSafe(b / eB) +
      c * lnSafe(c / eC) +
      d * lnSafe(d / eD));
  return a >= eA ? g2 : -g2;
}

// Spécificités du sous-corpus par rapport au reste du corpus.
// Renvoie une liste {word, fSub, fRest, expected, score} triée par
// |score| décroissant.
export function specificities(
  subTokens,
  restTokens,
  { lang, removeStopwords = false, minFreq = 2, top = 30 } = {}
) {
  const subN = subTokens.length;
  const restN = restTokens.length;
  if (!subN || !restN) return [];

  const subCount = new Map();
  const restCount = new Map();
  for (const w of subTokens) {
    if (removeStopwords && lang && isStopword(w, lang)) continue;
    subCount.set(w, (subCount.get(w) || 0) + 1);
  }
  for (const w of restTokens) {
    if (removeStopwords && lang && isStopword(w, lang)) continue;
    restCount.set(w, (restCount.get(w) || 0) + 1);
  }

  const seen = new Set([...subCount.keys(), ...restCount.keys()]);
  const out = [];
  for (const w of seen) {
    const fSub = subCount.get(w) || 0;
    const fRest = restCount.get(w) || 0;
    if (fSub + fRest < minFreq) continue;
    const F = fSub + fRest;
    const total = subN + restN;
    const expected = (subN * F) / total;
    const score = signedG2(fSub, fRest, subN - fSub, restN - fRest);
    out.push({ word: w, fSub, fRest, expected, score });
  }
  return out
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))
    .slice(0, top);
}

// Cooccurrences contextuelles d'un mot-clé : pour chaque mot, sa
// fréquence dans les fenêtres ±W autour des occurrences du mot-clé,
// notée par G² signé. Score positif = attire le mot-clé.
export function cooccurrences(
  text,
  keyword,
  {
    window = 5,
    caseSensitive = false,
    lang,
    removeStopwords = true,
    minFreq = 2,
    top = 30,
  } = {}
) {
  const target = caseSensitive ? keyword : keyword.toLowerCase();
  if (!target) return { totalIn: 0, totalOut: 0, keywordCount: 0, rows: [] };
  const tokens = tokenizeWords(text, { lowercase: !caseSensitive });
  const N = tokens.length;
  if (!N) return { totalIn: 0, totalOut: 0, keywordCount: 0, rows: [] };

  const inContext = new Uint8Array(N);
  let keywordCount = 0;
  for (let i = 0; i < N; i++) {
    if (tokens[i] === target) {
      keywordCount++;
      const from = Math.max(0, i - window);
      const to = Math.min(N - 1, i + window);
      for (let j = from; j <= to; j++) {
        if (j !== i) inContext[j] = 1;
      }
    }
  }

  const inCount = new Map();
  const totalCount = new Map();
  for (let i = 0; i < N; i++) {
    const w = tokens[i];
    if (w === target) continue;
    if (removeStopwords && lang && isStopword(w, lang)) continue;
    totalCount.set(w, (totalCount.get(w) || 0) + 1);
    if (inContext[i]) inCount.set(w, (inCount.get(w) || 0) + 1);
  }

  let totalIn = 0;
  for (const v of inCount.values()) totalIn += v;
  let totalAll = 0;
  for (const v of totalCount.values()) totalAll += v;
  const totalOut = totalAll - totalIn;

  const rows = [];
  for (const [w, f] of totalCount) {
    if (f < minFreq) continue;
    const a = inCount.get(w) || 0;
    const b = totalIn - a;
    const c = f - a;
    const d = totalOut - c;
    const score = signedG2(a, b, c, d);
    rows.push({ word: w, fWindow: a, fTotal: f, score });
  }
  return {
    totalIn,
    totalOut,
    keywordCount,
    rows: rows
      .sort((x, y) => Math.abs(y.score) - Math.abs(x.score))
      .slice(0, top),
  };
}

// Progression d'un mot-clé : positions relatives (0..1) des
// occurrences, plus densité par bin.
export function progression(text, keyword, { bins = 20, caseSensitive = false } = {}) {
  const target = caseSensitive ? keyword : keyword.toLowerCase();
  if (!target) return { total: 0, occurrences: [], buckets: [] };
  const tokens = tokenizeWords(text, { lowercase: false });
  const occurrences = [];
  for (let i = 0; i < tokens.length; i++) {
    const tk = caseSensitive ? tokens[i] : tokens[i].toLowerCase();
    if (tk === target) {
      occurrences.push({
        index: i,
        position: tokens.length > 1 ? i / (tokens.length - 1) : 0,
      });
    }
  }
  const buckets = Array.from({ length: bins }, (_, i) => ({
    bin: i,
    from: i / bins,
    to: (i + 1) / bins,
    count: 0,
  }));
  for (const o of occurrences) {
    const idx = Math.min(bins - 1, Math.floor(o.position * bins));
    buckets[idx].count++;
  }
  return { total: occurrences.length, occurrences, buckets, tokenCount: tokens.length };
}
