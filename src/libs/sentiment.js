// Analyse de sentiment lexicale (FR/EN), 100 % locale.
// Méthode : lexique de polarité + gestion de la négation et des
// adverbes d'intensité, agrégée par phrase puis sur tout le texte.

import { tokenizeWords, tokenizeSentences } from "./text.js";

const POS_FR = `bon bonne bien mieux meilleur excellent excellente superbe magnifique
merveilleux merveilleuse génial géniale parfait parfaite heureux heureuse joie
joyeux agréable aimer adorer aime adore aimé plaisir beau belle réussi réussite
succès positif positive fantastique formidable extraordinaire content contente
satisfait satisfaite ravi ravie enchanté chaleureux doux douce brillant
remarquable admirable sublime délicieux apprécier apprécié apprécie utile
efficace clair confiance espoir espérer rêve sourire rire fier fière calme
paisible sécurité liberté amour tendresse gentil gentille sympathique solide
fascinant captivant inspirant prometteur exceptionnel idéal bravo gagner gagné
victoire chance facile agréablement séduisant
fabuleux fabuleuse incontournable intéressant intéressante intéressants
intéressantes sympa enrichissant ludique ludiques passionnant passionnante
recommande recommander recommandé conseille conseiller top cool plaisant
divertissant instructif instructive éducatif éducative original originale
ravissant impressionnant impressionnante adoré adorent chouette extra
parfaitement génialissime qualité réussie superbes`;

const POS_FR_STRONG = `magnifique génial extraordinaire merveilleux adore adorer
fantastique sublime parfait exceptionnel formidable bravo victoire fabuleux
incontournable passionnant`;

const NEG_FR = `mauvais mauvaise mal pire pis horrible affreux affreuse terrible
nul nulle détester déteste détesté haine haïr triste tristesse pleurer peur
crainte colère furieux échec échouer décevant décevante décevantes déçu déçue déception catastrophe
désastre pénible ennuyeux ennui laid moche douleur souffrir souffrance pire
problème difficile dur inquiet inquiète angoisse désespoir méchant cruel injuste
pauvre lamentable médiocre nul agaçant énervant fatigué seul solitude sombre
cassé brisé perdre perdu perte erreur faute danger menace honte coupable
amer dégoût horreur stress tension conflit guerre violence mensonge trahir
dégradation dégradé dégradée archaïque insupportable exorbitant exorbitants
exorbitante dommage déplorable bof ennuyeux surchargé surchargée surchargées
raté ratée catastrophique regret regrette regretté abusé abusif honteux
scandaleux cher chère biaisé biaisée faux fausse insuffisant insuffisante
décevant nul vétuste sale bruyant`;

const NEG_FR_STRONG = `horrible affreux terrible catastrophe désastre désespoir
déteste détester haine atroce horreur abominable insupportable déplorable
catastrophique scandaleux`;

const POS_EN = `good great excellent wonderful amazing fantastic awesome perfect
happy joy love loving lovely beautiful brilliant best better success successful
positive nice pleasant delightful glad pleased grateful enjoy enjoyed superb
outstanding marvelous fabulous terrific gorgeous charming peaceful hope bright
win winner won kind warm smart clever inspiring fun safe trust calm confident
strong rich free freedom proud relief reliable helpful useful clear easy
fascinating exciting promising ideal cheerful brave thrilled`;

const POS_EN_STRONG = `amazing wonderful fantastic excellent perfect awesome
brilliant outstanding superb marvelous love best`;

const NEG_EN = `bad terrible awful horrible worst hate hatred sad sadness fear
anger angry fail failure disappointing disappointed disaster painful pain
suffering ugly boring poor problem difficult hard worried anxiety despair cruel
unfair miserable mediocre annoying nasty wrong loss lose lost lonely dark broke
broken weak fake danger threat shame guilty bitter disgust horror stress
conflict war violence lie betray sick tired stupid useless hopeless toxic`;

const NEG_EN_STRONG = `terrible awful horrible worst hate disaster despair
atrocious horror dreadful catastrophe`;

const NEGATORS = new Set(
  `ne n pas plus jamais rien aucun aucune sans ni non personne
   not no never none nobody nothing without cannot cant dont doesnt isnt arent
   wasnt werent neither nor hardly`.split(/\s+/).filter(Boolean)
);

const INTENSIFIERS = new Map([
  ["très", 1.6], ["trop", 1.5], ["vraiment", 1.5], ["extrêmement", 2],
  ["totalement", 1.7], ["absolument", 1.8], ["tellement", 1.6], ["si", 1.3],
  ["fort", 1.3], ["vachement", 1.6], ["super", 1.5], ["hyper", 1.7],
  ["peu", 0.5], ["moins", 0.5], ["légèrement", 0.5], ["plutôt", 0.7],
  ["assez", 0.8],
  ["very", 1.6], ["really", 1.5], ["extremely", 2], ["totally", 1.7],
  ["absolutely", 1.8], ["so", 1.3], ["too", 1.4], ["incredibly", 1.9],
  ["highly", 1.6], ["super", 1.5], ["slightly", 0.5], ["barely", 0.4],
  ["somewhat", 0.7], ["rather", 0.7], ["fairly", 0.8], ["less", 0.5],
]);

function buildLexicon() {
  const lex = new Map();
  const add = (blob, value) => {
    for (const w of blob.split(/\s+/)) {
      const k = w.trim().toLowerCase();
      if (k) lex.set(k, value);
    }
  };
  add(POS_FR, 1);
  add(POS_EN, 1);
  add(NEG_FR, -1);
  add(NEG_EN, -1);
  add(POS_FR_STRONG, 2);
  add(POS_EN_STRONG, 2);
  add(NEG_FR_STRONG, -2);
  add(NEG_EN_STRONG, -2);
  return lex;
}

const LEXICON = buildLexicon();

function labelFor(score) {
  if (score > 0.5) return "positif";
  if (score < -0.5) return "négatif";
  return "neutre";
}

// Analyse une phrase : applique négation (fenêtre de 3 mots) et
// adverbes d'intensité au mot de sentiment suivant.
function scoreSentence(sentence) {
  const words = tokenizeWords(sentence);
  let score = 0;
  let hits = 0;
  let pendingMult = 1;
  let negCountdown = 0;
  const contributions = [];

  for (const w of words) {
    if (NEGATORS.has(w)) {
      negCountdown = 3;
      continue;
    }
    if (INTENSIFIERS.has(w)) {
      pendingMult = INTENSIFIERS.get(w);
      // l'intensifieur ne décrémente pas la fenêtre : une négation
      // en cours ("pas très bon") reste active jusqu'au mot suivant.
      continue;
    }
    if (LEXICON.has(w)) {
      let value = LEXICON.get(w) * pendingMult;
      if (negCountdown > 0) value = -value;
      score += value;
      hits++;
      contributions.push({ word: w, value });
      pendingMult = 1;
    }
    if (negCountdown > 0) negCountdown--;
  }

  return { text: sentence, score, hits, contributions };
}

export function analyzeSentiment(text) {
  const sentences = tokenizeSentences(text).map(scoreSentence);

  let total = 0;
  let totalHits = 0;
  const counts = { positif: 0, neutre: 0, négatif: 0 };
  const wordTotals = new Map();

  for (const s of sentences) {
    total += s.score;
    totalHits += s.hits;
    counts[labelFor(s.score)]++;
    for (const c of s.contributions) {
      const cur = wordTotals.get(c.word) || { word: c.word, total: 0, count: 0 };
      cur.total += c.value;
      cur.count += 1;
      wordTotals.set(c.word, cur);
    }
  }

  const meanPerSentence = sentences.length ? total / sentences.length : 0;
  const overall = totalHits ? total / totalHits : 0;
  // Le label reflète la part nette de phrases orientées sur le total :
  // il faut une vraie majorité orientée (≥ 25 %) pour sortir du neutre.
  // Sinon (la plupart des phrases neutres) le global reste « neutre ».
  const netShare = sentences.length
    ? (counts.positif - counts["négatif"]) / sentences.length
    : 0;
  const label =
    totalHits === 0 || netShare === 0
      ? "neutre"
      : netShare >= 0.25
      ? "positif"
      : netShare <= -0.25
      ? "négatif"
      : "neutre";
  const words = [...wordTotals.values()];

  // Extraits « les plus positifs/négatifs » : seules les phrases
  // nettement orientées (|score| ≥ 1.5). Une phrase longue contenant
  // un seul mot faible (−1) reste neutre et n'est pas mise en avant.
  const ranked = (sign) =>
    sentences
      .filter((s) => (sign > 0 ? s.score >= 1.5 : s.score <= -1.5))
      .sort((a, b) => (sign > 0 ? b.score - a.score : a.score - b.score))
      .slice(0, 3);

  return {
    sentenceCount: sentences.length,
    analyzedWords: totalHits,
    counts,
    meanPerSentence,
    overall,
    label,
    // 0 = très négatif, 100 = très positif
    positivity: Math.round(((Math.max(-2, Math.min(2, overall)) + 2) / 4) * 100),
    topPositive: words
      .filter((w) => w.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 12),
    topNegative: words
      .filter((w) => w.total < 0)
      .sort((a, b) => a.total - b.total)
      .slice(0, 12),
    mostPositive: ranked(1),
    mostNegative: ranked(-1),
  };
}
