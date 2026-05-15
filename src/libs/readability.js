// Indices de lisibilité. Les formules anglaises (Flesch) et françaises
// (Kandel & Moles) reposent sur le ratio syllabes/mots ; LIX est
// indépendant de la langue.

export function fleschReadingEase({ words, sentences, syllables }) {
  if (!words || !sentences) return null;
  return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
}

export function fleschKincaidGrade({ words, sentences, syllables }) {
  if (!words || !sentences) return null;
  return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
}

// Adaptation française du Flesch (Kandel & Moles, 1958).
export function kandelMoles({ words, sentences, syllables }) {
  if (!words || !sentences) return null;
  return 207 - 1.015 * (words / sentences) - 73.6 * (syllables / words);
}

// Läsbarhetsindex : ratio indépendant de la langue.
export function lix({ words, sentences, longWords }) {
  if (!words || !sentences) return null;
  return words / sentences + (100 * longWords) / words;
}

export function interpretFlesch(score) {
  if (score == null) return { label: "—", level: "" };
  if (score >= 90) return { label: "Très facile", level: "easy" };
  if (score >= 70) return { label: "Facile", level: "easy" };
  if (score >= 60) return { label: "Assez facile", level: "ok" };
  if (score >= 50) return { label: "Moyen", level: "ok" };
  if (score >= 30) return { label: "Difficile", level: "hard" };
  return { label: "Très difficile", level: "hard" };
}

export function interpretLix(score) {
  if (score == null) return { label: "—", level: "" };
  if (score < 30) return { label: "Très facile", level: "easy" };
  if (score < 40) return { label: "Facile", level: "easy" };
  if (score < 50) return { label: "Moyen", level: "ok" };
  if (score < 60) return { label: "Difficile", level: "hard" };
  return { label: "Très difficile", level: "hard" };
}
