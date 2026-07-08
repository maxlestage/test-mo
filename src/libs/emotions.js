// Analyse des émotions (roue de Plutchik : 8 émotions de base) et de la
// sensibilité émotionnelle du texte. Méthode : lexiques FR/EN par émotion,
// gestion de la négation (bascule vers l'émotion opposée, atténuée) et des
// adverbes d'intensité, agrégée par phrase. 100 % local.

import { tokenizeWords, tokenizeSentences } from "./text.js";
import { NEGATORS, INTENSIFIERS } from "./sentiment.js";

export const EMOTIONS = [
  "joie",
  "tristesse",
  "colère",
  "peur",
  "surprise",
  "dégoût",
  "confiance",
  "anticipation",
];

// Paires opposées de la roue de Plutchik : une émotion niée
// (« pas heureux ») est comptée pour son opposée, à demi-poids.
const OPPOSITE = {
  joie: "tristesse",
  tristesse: "joie",
  colère: "peur",
  peur: "colère",
  surprise: "anticipation",
  anticipation: "surprise",
  dégoût: "confiance",
  confiance: "dégoût",
};

// Lexiques FR + EN mélangés (la recherche est indépendante de la langue,
// comme pour le sentiment).
const LEX_SRC = {
  joie: `joie joyeux joyeuse heureux heureuse bonheur content contente ravi
    ravie enchanté enchantée sourire sourires rire rires amusant amusante
    plaisir réjouir réjoui réjouie gai gaie allégresse euphorie enthousiasme
    enthousiaste fête fêter célébrer célébration jubiler épanoui épanouie
    adore adorer adoré aime aimer aimé amour merveilleux merveilleuse génial
    géniale formidable magnifique superbe délice délicieux savourer
    happy happiness joy joyful cheerful delighted delight glad pleased
    pleasure smile smiling laugh laughter fun funny enjoy enjoyed enjoying
    love loved lovely wonderful amazing awesome fantastic celebrate
    celebration bliss blissful thrilled merry rejoice cheer`,

  tristesse: `triste tristesse chagrin peine peiné peinée malheureux
    malheureuse pleurer pleure larmes larme sanglot déprimé déprimée
    déprimant dépression mélancolie mélancolique désespoir désespéré
    désespérée nostalgie nostalgique deuil regret regrets regretter
    souffrance souffrir douleur douloureux douloureuse abattu abattue morose
    sombre solitude seul seule isolé isolée manque manquer perdu perdue perte
    sad sadness unhappy sorrow sorrowful grief grieve mourn mourning cry
    crying tears tearful depressed depressing depression melancholy despair
    hopeless lonely loneliness miss missed loss lost heartbroken heartbreak
    gloomy miserable regretted weep`,

  colère: `colère furieux furieuse fureur rage enragé enragée énervé énervée
    énervant agacé agacée agacement agaçant irrité irritée irritation
    irritant exaspéré exaspérée indigné indignée indignation révolté révoltée
    révoltant scandalisé scandalisée scandaleux haine haïr déteste détester
    détesté insupportable inadmissible injuste injustice frustré frustrée
    frustrant frustration hostile agressif agressive vengeance jaloux jalouse
    angry anger furious fury rage raging enraged mad outraged outrage
    outrageous irritated irritating irritation annoyed annoying resent
    resentment hate hatred hostile aggressive frustrated frustrating
    frustration unfair injustice revenge jealous insult insulted offensive`,

  peur: `peur peurs effrayé effrayée effrayant effrayante terreur terrifié
    terrifiée terrifiant épouvante épouvantable angoisse angoissé angoissée
    angoissant anxiété anxieux anxieuse inquiet inquiète inquiétude
    inquiétant inquiétante crainte craindre redouter redouté panique paniqué
    paniquée affolé affolée menace menaçant menaçante danger dangereux
    dangereuse alarme alarmant frisson trembler tremblant cauchemar phobie
    fear afraid scared scary frightened frightening fright terror terrified
    terrifying dread dreadful anxious anxiety worried worry worrying panic
    panicked threat threatened threatening danger dangerous alarm alarming
    nightmare phobia tremble trembling`,

  surprise: `surprise surprises surpris surprenant surprenante étonné étonnée
    étonnant étonnante étonnement stupéfait stupéfaite stupéfiant abasourdi
    abasourdie ébahi ébahie sidéré sidérée inattendu inattendue imprévu
    imprévue soudain soudaine soudainement renversant saisissant choc choqué
    choquée
    surprised surprising surprise astonished astonishing amazed astounded
    stunned startled startling unexpected unexpectedly sudden suddenly
    unbelievable shocking shocked shock wow`,

  dégoût: `dégoût dégoûté dégoûtée dégoûtant dégoûtante écœuré écœurée
    écœurant écœurante répugnant répugnante répugner répulsion immonde
    infect infecte ignoble abject abjecte nauséabond nauséabonde nausée sale
    saleté pourri pourrie moisi moisie vomir méprisable mépris
    disgust disgusted disgusting gross nasty revolting repulsive sickening
    nauseating nausea filthy foul rotten vile loathsome loathe loathing
    contempt despicable yuck repugnant`,

  confiance: `confiance confiant confiante fiable fiabilité sûr sûre sécurité
    sécurisant rassurant rassurante rassuré rassurée serein sereine sérénité
    apaisé apaisée apaisant calme tranquille tranquillité loyal loyale
    loyauté fidèle fidélité honnête honnêteté sincère sincérité crédible
    respect respecté respectée admiration admirer soutien solidarité
    trust trusted trusting trustworthy reliable dependable faith faithful
    confident confidence secure safe safety reassuring reassured calm
    peaceful serene serenity loyal loyalty honest honesty sincere sincerity
    credible respect respected admire admiration support supportive`,

  anticipation: `anticipation anticiper attendre attente attendu attendue
    espérer espère espéré espoir espérance impatient impatiente impatience
    hâte curieux curieuse curiosité préparer préparatif préparation projet
    projets avenir futur bientôt demain perspective perspectives promesse
    prometteur prometteuse envie désir désirer souhait souhaiter rêver rêve
    rêves
    anticipate anticipation await awaiting expect expected expectation
    expectations hope hopeful hoping eager eagerness impatient curious
    curiosity soon tomorrow future upcoming promising wish wished desire
    dream dreams excited excitement forward`,
};

function buildLexicon() {
  const lex = new Map();
  for (const [emotion, blob] of Object.entries(LEX_SRC)) {
    for (const w of blob.split(/\s+/)) {
      const k = w.trim().toLowerCase();
      if (k) lex.set(k, emotion);
    }
  }
  return lex;
}

const LEXICON = buildLexicon();

function emptyScores() {
  const s = {};
  for (const e of EMOTIONS) s[e] = 0;
  return s;
}

// Analyse une phrase : négation (fenêtre de 3 mots) → émotion opposée à
// demi-poids ; adverbe d'intensité appliqué au mot d'émotion suivant.
function scoreSentence(sentence) {
  const words = tokenizeWords(sentence);
  const scores = emptyScores();
  let pendingMult = 1;
  let negCountdown = 0;
  let hits = 0;
  let weight = 0;
  const contributions = [];

  for (const w of words) {
    if (NEGATORS.has(w)) {
      negCountdown = 3;
      continue;
    }
    if (INTENSIFIERS.has(w)) {
      pendingMult = INTENSIFIERS.get(w);
      continue;
    }
    const emotion = LEXICON.get(w);
    if (emotion) {
      let target = emotion;
      let value = pendingMult;
      if (negCountdown > 0) {
        target = OPPOSITE[emotion];
        value *= 0.5;
      }
      scores[target] += value;
      hits++;
      weight += value;
      contributions.push({ word: w, emotion: target, value });
      pendingMult = 1;
    }
    if (negCountdown > 0) negCountdown--;
  }

  return { text: sentence, wordCount: words.length, scores, hits, weight, contributions };
}

function dominantOf(scores) {
  let best = null;
  let bestVal = 0;
  for (const e of EMOTIONS) {
    if (scores[e] > bestVal) {
      bestVal = scores[e];
      best = e;
    }
  }
  return best;
}

function sensitivityLabel(index) {
  if (index < 25) return "faible";
  if (index < 50) return "modérée";
  if (index < 75) return "élevée";
  return "très élevée";
}

export function analyzeEmotions(text) {
  const sentences = tokenizeSentences(text).map(scoreSentence);

  const totals = emptyScores();
  const wordCounts = new Map(); // word -> { word, emotion, total, count }
  let totalWords = 0;
  let totalHits = 0;
  let totalWeight = 0;
  let emotionalSentences = 0;

  for (const s of sentences) {
    totalWords += s.wordCount;
    totalHits += s.hits;
    totalWeight += s.weight;
    if (s.hits > 0) emotionalSentences++;
    for (const e of EMOTIONS) totals[e] += s.scores[e];
    for (const c of s.contributions) {
      const cur =
        wordCounts.get(c.word) ||
        { word: c.word, emotion: c.emotion, total: 0, count: 0 };
      cur.total += c.value;
      cur.count += 1;
      wordCounts.set(c.word, cur);
    }
  }

  const grandTotal = EMOTIONS.reduce((sum, e) => sum + totals[e], 0);
  const distribution = EMOTIONS.map((e) => ({
    emotion: e,
    score: totals[e],
    share: grandTotal ? totals[e] / grandTotal : 0,
  })).sort((a, b) => b.score - a.score);

  const dominant = grandTotal ? dominantOf(totals) : null;

  // Sensibilité émotionnelle : combinaison de trois signaux normalisés.
  // – densité : part de mots porteurs d'émotion (≈ 8 % = texte très chargé)
  // – couverture : part de phrases contenant au moins une émotion
  // – intensité : poids moyen par occurrence (> 1 si intensifieurs)
  const density = totalWords ? totalHits / totalWords : 0;
  const coverage = sentences.length ? emotionalSentences / sentences.length : 0;
  const intensity = totalHits ? totalWeight / totalHits : 0;
  const densityN = Math.min(1, density / 0.08);
  const intensityN = Math.min(1, intensity / 1.6);
  const index = Math.round(
    100 * (0.45 * densityN + 0.35 * coverage + 0.2 * intensityN)
  );

  // Mots marquants par émotion (max 8 chacun).
  const topWords = {};
  for (const e of EMOTIONS) {
    topWords[e] = [...wordCounts.values()]
      .filter((w) => w.emotion === e)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }

  // Passages les plus sensibles : phrases au poids émotionnel le plus fort
  // (au moins 2 pour éviter de promouvoir une phrase quasi neutre).
  const mostSensitive = sentences
    .filter((s) => s.weight >= 2)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map((s) => ({
      text: s.text,
      weight: s.weight,
      dominant: dominantOf(s.scores),
    }));

  return {
    sentenceCount: sentences.length,
    totalWords,
    emotionalWords: totalHits,
    emotionalSentences,
    distribution,
    dominant,
    topWords,
    mostSensitive,
    sensitivity: {
      index,
      label: sensitivityLabel(index),
      density,
      coverage,
      intensity,
    },
  };
}
