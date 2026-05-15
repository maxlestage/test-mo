// Primitives de traitement du texte : normalisation et tokenisation.
// Tout est Unicode-aware (français, anglais et autres langues latines).

export function stripDiacritics(value) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function normalize(value) {
  return (value ?? "").normalize("NFC");
}

const WORD_RE = /\p{L}[\p{L}\p{M}]*(?:-[\p{L}\p{M}]+)*/gu;

// Découpe un texte en mots. Les traits d'union internes sont conservés
// ("peut-être"), les apostrophes séparent les clitiques ("l'arbre" -> l, arbre).
export function tokenizeWords(text, { lowercase = true } = {}) {
  const source = normalize(text);
  const matches = source.match(WORD_RE) || [];
  return lowercase ? matches.map((w) => w.toLowerCase()) : matches;
}

const ABBREVIATIONS = new Set([
  "m", "mm", "mme", "mlle", "dr", "pr", "st", "ste", "etc", "cf", "ex",
  "vs", "no", "art", "ed", "vol", "p", "pp", "fig", "mr", "mrs", "ms",
]);

// Découpe en phrases en évitant les faux positifs sur les abréviations
// courantes et les nombres décimaux.
export function tokenizeSentences(text) {
  const source = normalize(text).replace(/\s+/g, " ").trim();
  if (!source) return [];

  const sentences = [];
  let start = 0;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch !== "." && ch !== "!" && ch !== "?" && ch !== "…") continue;

    const next = source[i + 1];
    const isBoundary = next === undefined || next === " ";
    if (!isBoundary) continue;

    if (ch === ".") {
      const before = source.slice(Math.max(0, start), i);
      const lastWord = (before.match(/[\p{L}\p{M}]+$/u) || [""])[0].toLowerCase();
      if (ABBREVIATIONS.has(lastWord)) continue;
      if (/\d$/.test(source[i - 1] || "") && /\d/.test(next || "")) continue;
    }

    let end = i + 1;
    while (end < source.length && /["»”'’)\]]/u.test(source[end])) end++;
    const sentence = source.slice(start, end).trim();
    if (sentence) sentences.push(sentence);
    start = end;
  }

  const tail = source.slice(start).trim();
  if (tail) sentences.push(tail);
  return sentences;
}

export function tokenizeParagraphs(text) {
  return normalize(text)
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const VOWELS_EN = "aeiouy";
const VOWELS_FR = "aeiouyàâäéèêëïîôöùûüÿœæ";

// Estimation heuristique du nombre de syllabes (suffisant pour les
// indices de lisibilité). `lang` vaut "fr" ou "en".
export function countSyllables(word, lang = "fr") {
  const w = stripDiacritics(word.toLowerCase()).replace(/[^a-z]/g, "");
  if (!w) return 0;
  const vowels = lang === "fr" ? VOWELS_FR : VOWELS_EN;
  const set = new Set(stripDiacritics(vowels));

  let groups = 0;
  let prevVowel = false;
  for (const ch of w) {
    const isVowel = set.has(ch);
    if (isVowel && !prevVowel) groups++;
    prevVowel = isVowel;
  }

  if (lang === "en") {
    if (w.endsWith("e") && groups > 1) groups--;
    if (/(?:[^aeiou]le)$/.test(w)) groups++;
  } else if (w.endsWith("e") && groups > 1) {
    groups--;
  }

  return Math.max(1, groups);
}
