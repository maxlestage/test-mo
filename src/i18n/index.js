// i18n minimaliste (sans dépendance) : locale réactive persistée,
// fonction t() avec repli FR puis clé brute.

import { ref, computed } from "vue";

const KEY = "mo-grid-locale";
const SUPPORTED = ["fr", "en", "es"];

function read() {
  try {
    const v = localStorage.getItem(KEY);
    if (SUPPORTED.includes(v)) return v;
  } catch {
    /* indisponible */
  }
  return "fr";
}

const locale = ref(read());

const messages = {
  fr: {
    "app.tagline": "Atelier d'analyse linguistique de texte",
    "app.local": "100 % local · aucune donnée envoyée",
    "app.toLight": "Thème clair",
    "app.toDark": "Thème sombre",
    "app.uiLang": "Langue de l'interface",
    "nav.menu": "Menu",

    "tabs.overview": "Vue d'ensemble",
    "tabs.frequency": "Fréquences",
    "tabs.diversity": "Richesse lexicale",
    "tabs.readability": "Lisibilité",
    "tabs.sentiment": "Sentiment",
    "tabs.speakers": "Locuteurs",
    "tabs.ngram": "N-grammes",
    "tabs.kwic": "Concordance",

    "view.export": "⤓ Exporter en PDF",
    "view.welcome": "Bienvenue dans Mo-Grid",
    "view.welcomeDesc":
      "Écrivez ou collez votre texte ci-dessous pour lancer l'analyse — ou importez un fichier (tous formats texte) depuis le panneau Corpus.",
    "view.placeholder": "Écrivez ou collez votre texte ici…",
    "view.hint": "Astuce : Ctrl/⌘ + Entrée pour analyser",
    "view.analyze": "Analyser le texte",
    "view.feat1": "Statistiques de texte et longueur des mots",
    "view.feat2": "Fréquences lexicales et filtrage des mots vides",
    "view.feat3": "Richesse lexicale (TTR, Guiraud, Herdan, Maas…)",
    "view.feat4": "Lisibilité (Flesch, Kandel & Moles, LIX) et sentiment",
    "view.feat5": "N-grammes, collocations (PMI) et concordance (KWIC)",

    "mgr.corpus": "Corpus",
    "mgr.empty": "Aucun document. Importez ou collez un texte.",
    "mgr.delete": "Supprimer",
    "mgr.paste": "Coller un texte",
    "mgr.cancel": "Annuler",
    "mgr.namePh": "Nom (optionnel)",
    "mgr.textPh": "Collez votre texte ici…",
    "mgr.add": "Ajouter",
    "mgr.samples": "Charger des exemples",
    "mgr.clear": "Tout effacer",
    "mgr.settings": "Réglages",
    "mgr.analysisLang": "Langue d'analyse",
    "mgr.auto": "Détection auto",
    "mgr.fr": "Français",
    "mgr.en": "Anglais",
    "mgr.removeStop": "Exclure les mots vides",
    "mgr.pasted": "Texte collé",

    "up.drop": "Déposer des fichiers ici",
    "up.browse": "ou cliquer pour parcourir · tous formats texte",

    "ov.words": "Mots",
    "ov.unique": "Mots uniques",
    "ov.sentences": "Phrases",
    "ov.paragraphs": "Paragraphes",
    "ov.chars": "Caractères",
    "ov.charsNs": "Sans espaces",
    "ov.awl": "Long. moy. mot",
    "ov.wps": "Mots / phrase",
    "ov.lang": "Langue",
    "ov.reading": "Temps de lecture",
    "ov.longest": "Mot le plus long",
    "ov.distTitle": "Distribution de la longueur des mots",
    "ov.letters": "lettres",

    "fq.filter": "Filtrer un mot…",
    "fq.top": "Top",
    "fq.stopIncl": "Mots vides inclus",
    "fq.stopExcl": "Mots vides exclus",
    "fq.word": "Mot",
    "fq.occ": "Occurrences",
    "fq.freq": "Fréquence",

    "dv.intro":
      "La richesse lexicale mesure la variété du vocabulaire. Plusieurs indices corrigent différemment l'effet de la longueur du texte.",
    "dv.tokens": "Tokens / Types",
    "dv.ttr": "TTR (Type-Token Ratio)",
    "dv.guiraud": "Indice de Guiraud",
    "dv.cttr": "CTTR (corrigé)",
    "dv.herdan": "Constante C de Herdan",
    "dv.maas": "Indice a² de Maas",
    "dv.hapax": "Hapax legomena",
    "dv.hTokens": "Nombre total de mots et nombre de mots distincts.",
    "dv.hTtr":
      "Types ÷ tokens. Plus c'est élevé, plus le vocabulaire est varié (sensible à la longueur).",
    "dv.hGuiraud": "Types ÷ √tokens. Variante du TTR moins sensible à la longueur.",
    "dv.hCttr": "Types ÷ √(2·tokens). TTR corrigé de Carroll.",
    "dv.hHerdan": "log(types) ÷ log(tokens). Robuste à la taille du corpus.",
    "dv.hMaas": "(log N − log V) ÷ log²N. Plus la valeur est basse, plus le texte est riche.",
    "dv.hHapax": "Mots n'apparaissant qu'une seule fois dans le texte.",

    "rd.words": "mots",
    "rd.sentences": "phrases",
    "rd.syll": "syllabes",
    "rd.long": "mots longs (> 6)",
    "rd.lvlEasy": "Facile",
    "rd.lvlOk": "Moyen",
    "rd.lvlHard": "Difficile",
    "rd.grade": "Niveau scolaire ≈",
    "rd.hKm": "Adaptation française de l'indice de Flesch. 0 = très difficile, 100 = très facile.",
    "rd.hFre": "Indice de facilité de lecture. 0 = très difficile, 100 = très facile.",
    "rd.hFk": "Niveau de scolarité (US) requis pour comprendre le texte.",
    "rd.hLix": "Mots/phrase + 100 × mots longs/mots. < 30 facile, > 60 difficile.",

    "st.intro":
      "Détection lexicale du ressenti exprimé (lexique FR/EN, négation et adverbes d'intensité). Analyse 100 % locale.",
    "st.global": "Tonalité globale",
    "st.positivity": "Indice de positivité",
    "st.mean": "Score moyen / phrase",
    "st.sentences": "Phrases analysées",
    "st.emo": "Mots porteurs d'émotion",
    "st.dist": "Répartition des phrases",
    "st.pos": "Positives",
    "st.neu": "Neutres",
    "st.neg": "Négatives",
    "st.posWords": "Mots positifs marquants",
    "st.negWords": "Mots négatifs marquants",
    "st.posPhr": "Phrases les plus positives",
    "st.negPhr": "Phrases les plus négatives",
    "st.none": "Aucun",
    "mood.positif": "positif",
    "mood.négatif": "négatif",
    "mood.neutre": "neutre",

    "sp.intro":
      "Détection automatique des intervenants (chat, transcription, interview, export WhatsApp…). Pour chaque personne : humeur, mots-clés et extrait représentatif. 100 % local.",
    "sp.idea": "Idée générale",
    "sp.speakersN": "locuteurs",
    "sp.turns": "interventions",
    "sp.one": "Un seul locuteur détecté",
    "sp.short": "Texte trop court.",
    "sp.moodAll": "Humeur d'ensemble",
    "sp.note":
      "Aucun marqueur de dialogue (« Nom : … ») trouvé : le texte est traité comme un seul auteur. Utilisez un format « Alice : message » pour une analyse par personne.",
    "sp.intervN": "intervention(s)",
    "sp.wordsN": "mots",
    "sp.kw": "Mots-clés",
    "sp.author": "Auteur",

    "ng.title": "N-grammes",
    "ng.colloc": "Collocations (par PMI)",
    "ng.collocDesc":
      "Cooccurrences plus fréquentes que ne le voudrait le hasard (information mutuelle ponctuelle, mots vides exclus).",
    "ng.bigram": "Bigramme",
    "ng.occ": "Occ.",
    "ng.short": "Texte trop court.",
    "ng.grams": "-grammes",

    "kw.placeholder": "Mot-clé à rechercher…",
    "kw.context": "Contexte",
    "kw.wordsN": "mots",
    "kw.case": "Respecter la casse",
    "kw.occ": "occurrence(s)",
    "kw.none": "Aucune occurrence trouvée.",
    "kw.prompt":
      "Saisissez un mot pour afficher ses occurrences en contexte (KWIC).",
  },

  en: {
    "app.tagline": "Text linguistics analysis workbench",
    "app.local": "100% local · no data sent",
    "app.toLight": "Light theme",
    "app.toDark": "Dark theme",
    "app.uiLang": "Interface language",
    "nav.menu": "Menu",

    "tabs.overview": "Overview",
    "tabs.frequency": "Frequencies",
    "tabs.diversity": "Lexical richness",
    "tabs.readability": "Readability",
    "tabs.sentiment": "Sentiment",
    "tabs.speakers": "Speakers",
    "tabs.ngram": "N-grams",
    "tabs.kwic": "Concordance",

    "view.export": "⤓ Export to PDF",
    "view.welcome": "Welcome to Mo-Grid",
    "view.welcomeDesc":
      "Write or paste your text below to start the analysis — or import a file (any text format) from the Corpus panel.",
    "view.placeholder": "Write or paste your text here…",
    "view.hint": "Tip: Ctrl/⌘ + Enter to analyze",
    "view.analyze": "Analyze text",
    "view.feat1": "Text statistics and word length",
    "view.feat2": "Word frequencies and stop-word filtering",
    "view.feat3": "Lexical richness (TTR, Guiraud, Herdan, Maas…)",
    "view.feat4": "Readability (Flesch, Kandel & Moles, LIX) and sentiment",
    "view.feat5": "N-grams, collocations (PMI) and concordance (KWIC)",

    "mgr.corpus": "Corpus",
    "mgr.empty": "No document. Import or paste a text.",
    "mgr.delete": "Delete",
    "mgr.paste": "Paste a text",
    "mgr.cancel": "Cancel",
    "mgr.namePh": "Name (optional)",
    "mgr.textPh": "Paste your text here…",
    "mgr.add": "Add",
    "mgr.samples": "Load samples",
    "mgr.clear": "Clear all",
    "mgr.settings": "Settings",
    "mgr.analysisLang": "Analysis language",
    "mgr.auto": "Auto-detect",
    "mgr.fr": "French",
    "mgr.en": "English",
    "mgr.removeStop": "Exclude stop words",
    "mgr.pasted": "Pasted text",

    "up.drop": "Drop files here",
    "up.browse": "or click to browse · any text format",

    "ov.words": "Words",
    "ov.unique": "Unique words",
    "ov.sentences": "Sentences",
    "ov.paragraphs": "Paragraphs",
    "ov.chars": "Characters",
    "ov.charsNs": "No spaces",
    "ov.awl": "Avg. word len.",
    "ov.wps": "Words / sentence",
    "ov.lang": "Language",
    "ov.reading": "Reading time",
    "ov.longest": "Longest word",
    "ov.distTitle": "Word length distribution",
    "ov.letters": "letters",

    "fq.filter": "Filter a word…",
    "fq.top": "Top",
    "fq.stopIncl": "Stop words included",
    "fq.stopExcl": "Stop words excluded",
    "fq.word": "Word",
    "fq.occ": "Occurrences",
    "fq.freq": "Frequency",

    "dv.intro":
      "Lexical richness measures vocabulary variety. Several indices correct for text length in different ways.",
    "dv.tokens": "Tokens / Types",
    "dv.ttr": "TTR (Type-Token Ratio)",
    "dv.guiraud": "Guiraud's index",
    "dv.cttr": "CTTR (corrected)",
    "dv.herdan": "Herdan's C",
    "dv.maas": "Maas a² index",
    "dv.hapax": "Hapax legomena",
    "dv.hTokens": "Total number of words and number of distinct words.",
    "dv.hTtr":
      "Types ÷ tokens. Higher means more varied vocabulary (length-sensitive).",
    "dv.hGuiraud": "Types ÷ √tokens. TTR variant, less length-sensitive.",
    "dv.hCttr": "Types ÷ √(2·tokens). Carroll's corrected TTR.",
    "dv.hHerdan": "log(types) ÷ log(tokens). Robust to corpus size.",
    "dv.hMaas": "(log N − log V) ÷ log²N. Lower value means richer text.",
    "dv.hHapax": "Words occurring only once in the text.",

    "rd.words": "words",
    "rd.sentences": "sentences",
    "rd.syll": "syllables",
    "rd.long": "long words (> 6)",
    "rd.lvlEasy": "Easy",
    "rd.lvlOk": "Medium",
    "rd.lvlHard": "Hard",
    "rd.grade": "School grade ≈",
    "rd.hKm": "French adaptation of the Flesch index. 0 = very hard, 100 = very easy.",
    "rd.hFre": "Reading ease index. 0 = very hard, 100 = very easy.",
    "rd.hFk": "US school grade required to understand the text.",
    "rd.hLix": "Words/sentence + 100 × long words/words. < 30 easy, > 60 hard.",

    "st.intro":
      "Lexical detection of expressed sentiment (FR/EN lexicon, negation and intensifiers). 100% local analysis.",
    "st.global": "Overall tone",
    "st.positivity": "Positivity index",
    "st.mean": "Avg. score / sentence",
    "st.sentences": "Sentences analyzed",
    "st.emo": "Emotion-bearing words",
    "st.dist": "Sentence breakdown",
    "st.pos": "Positive",
    "st.neu": "Neutral",
    "st.neg": "Negative",
    "st.posWords": "Notable positive words",
    "st.negWords": "Notable negative words",
    "st.posPhr": "Most positive sentences",
    "st.negPhr": "Most negative sentences",
    "st.none": "None",
    "mood.positif": "positive",
    "mood.négatif": "negative",
    "mood.neutre": "neutral",

    "sp.intro":
      "Automatic speaker detection (chat, transcript, interview, WhatsApp export…). For each person: mood, keywords and a representative excerpt. 100% local.",
    "sp.idea": "General idea",
    "sp.speakersN": "speakers",
    "sp.turns": "turns",
    "sp.one": "Single speaker detected",
    "sp.short": "Text too short.",
    "sp.moodAll": "Overall mood",
    "sp.note":
      "No dialogue marker (\"Name: …\") found: the text is treated as a single author. Use an \"Alice: message\" format for per-person analysis.",
    "sp.intervN": "turn(s)",
    "sp.wordsN": "words",
    "sp.kw": "Keywords",
    "sp.author": "Author",

    "ng.title": "N-grams",
    "ng.colloc": "Collocations (by PMI)",
    "ng.collocDesc":
      "Co-occurrences more frequent than chance would predict (pointwise mutual information, stop words excluded).",
    "ng.bigram": "Bigram",
    "ng.occ": "Occ.",
    "ng.short": "Text too short.",
    "ng.grams": "-grams",

    "kw.placeholder": "Keyword to search…",
    "kw.context": "Context",
    "kw.wordsN": "words",
    "kw.case": "Case sensitive",
    "kw.occ": "occurrence(s)",
    "kw.none": "No occurrence found.",
    "kw.prompt": "Enter a word to see it in context (KWIC).",
  },

  es: {
    "app.tagline": "Taller de análisis lingüístico de texto",
    "app.local": "100 % local · no se envían datos",
    "app.toLight": "Tema claro",
    "app.toDark": "Tema oscuro",
    "app.uiLang": "Idioma de la interfaz",
    "nav.menu": "Menú",

    "tabs.overview": "Resumen",
    "tabs.frequency": "Frecuencias",
    "tabs.diversity": "Riqueza léxica",
    "tabs.readability": "Legibilidad",
    "tabs.sentiment": "Sentimiento",
    "tabs.speakers": "Interlocutores",
    "tabs.ngram": "N-gramas",
    "tabs.kwic": "Concordancia",

    "view.export": "⤓ Exportar a PDF",
    "view.welcome": "Bienvenido a Mo-Grid",
    "view.welcomeDesc":
      "Escriba o pegue su texto abajo para iniciar el análisis — o importe un archivo (cualquier formato de texto) desde el panel Corpus.",
    "view.placeholder": "Escriba o pegue su texto aquí…",
    "view.hint": "Consejo: Ctrl/⌘ + Intro para analizar",
    "view.analyze": "Analizar el texto",
    "view.feat1": "Estadísticas de texto y longitud de palabras",
    "view.feat2": "Frecuencias léxicas y filtrado de palabras vacías",
    "view.feat3": "Riqueza léxica (TTR, Guiraud, Herdan, Maas…)",
    "view.feat4": "Legibilidad (Flesch, Kandel & Moles, LIX) y sentimiento",
    "view.feat5": "N-gramas, colocaciones (PMI) y concordancia (KWIC)",

    "mgr.corpus": "Corpus",
    "mgr.empty": "Sin documentos. Importe o pegue un texto.",
    "mgr.delete": "Eliminar",
    "mgr.paste": "Pegar un texto",
    "mgr.cancel": "Cancelar",
    "mgr.namePh": "Nombre (opcional)",
    "mgr.textPh": "Pegue su texto aquí…",
    "mgr.add": "Añadir",
    "mgr.samples": "Cargar ejemplos",
    "mgr.clear": "Borrar todo",
    "mgr.settings": "Ajustes",
    "mgr.analysisLang": "Idioma de análisis",
    "mgr.auto": "Detección automática",
    "mgr.fr": "Francés",
    "mgr.en": "Inglés",
    "mgr.removeStop": "Excluir palabras vacías",
    "mgr.pasted": "Texto pegado",

    "up.drop": "Suelte archivos aquí",
    "up.browse": "o haga clic para explorar · cualquier formato de texto",

    "ov.words": "Palabras",
    "ov.unique": "Palabras únicas",
    "ov.sentences": "Frases",
    "ov.paragraphs": "Párrafos",
    "ov.chars": "Caracteres",
    "ov.charsNs": "Sin espacios",
    "ov.awl": "Long. media palabra",
    "ov.wps": "Palabras / frase",
    "ov.lang": "Idioma",
    "ov.reading": "Tiempo de lectura",
    "ov.longest": "Palabra más larga",
    "ov.distTitle": "Distribución de la longitud de palabras",
    "ov.letters": "letras",

    "fq.filter": "Filtrar una palabra…",
    "fq.top": "Top",
    "fq.stopIncl": "Palabras vacías incluidas",
    "fq.stopExcl": "Palabras vacías excluidas",
    "fq.word": "Palabra",
    "fq.occ": "Ocurrencias",
    "fq.freq": "Frecuencia",

    "dv.intro":
      "La riqueza léxica mide la variedad del vocabulario. Varios índices corrigen el efecto de la longitud del texto de forma distinta.",
    "dv.tokens": "Tokens / Tipos",
    "dv.ttr": "TTR (Type-Token Ratio)",
    "dv.guiraud": "Índice de Guiraud",
    "dv.cttr": "CTTR (corregido)",
    "dv.herdan": "Constante C de Herdan",
    "dv.maas": "Índice a² de Maas",
    "dv.hapax": "Hapax legomena",
    "dv.hTokens": "Número total de palabras y número de palabras distintas.",
    "dv.hTtr":
      "Tipos ÷ tokens. Cuanto más alto, más variado el vocabulario (sensible a la longitud).",
    "dv.hGuiraud": "Tipos ÷ √tokens. Variante del TTR menos sensible a la longitud.",
    "dv.hCttr": "Tipos ÷ √(2·tokens). TTR corregido de Carroll.",
    "dv.hHerdan": "log(tipos) ÷ log(tokens). Robusto al tamaño del corpus.",
    "dv.hMaas": "(log N − log V) ÷ log²N. Cuanto menor, más rico el texto.",
    "dv.hHapax": "Palabras que aparecen una sola vez en el texto.",

    "rd.words": "palabras",
    "rd.sentences": "frases",
    "rd.syll": "sílabas",
    "rd.long": "palabras largas (> 6)",
    "rd.lvlEasy": "Fácil",
    "rd.lvlOk": "Medio",
    "rd.lvlHard": "Difícil",
    "rd.grade": "Nivel escolar ≈",
    "rd.hKm": "Adaptación francesa del índice de Flesch. 0 = muy difícil, 100 = muy fácil.",
    "rd.hFre": "Índice de facilidad de lectura. 0 = muy difícil, 100 = muy fácil.",
    "rd.hFk": "Nivel escolar (EE. UU.) requerido para entender el texto.",
    "rd.hLix": "Palabras/frase + 100 × palabras largas/palabras. < 30 fácil, > 60 difícil.",

    "st.intro":
      "Detección léxica del sentimiento expresado (léxico FR/EN, negación e intensificadores). Análisis 100 % local.",
    "st.global": "Tono global",
    "st.positivity": "Índice de positividad",
    "st.mean": "Puntuación media / frase",
    "st.sentences": "Frases analizadas",
    "st.emo": "Palabras con carga emocional",
    "st.dist": "Distribución de frases",
    "st.pos": "Positivas",
    "st.neu": "Neutras",
    "st.neg": "Negativas",
    "st.posWords": "Palabras positivas destacadas",
    "st.negWords": "Palabras negativas destacadas",
    "st.posPhr": "Frases más positivas",
    "st.negPhr": "Frases más negativas",
    "st.none": "Ninguna",
    "mood.positif": "positivo",
    "mood.négatif": "negativo",
    "mood.neutre": "neutro",

    "sp.intro":
      "Detección automática de interlocutores (chat, transcripción, entrevista, exportación de WhatsApp…). Por persona: estado de ánimo, palabras clave y un extracto representativo. 100 % local.",
    "sp.idea": "Idea general",
    "sp.speakersN": "interlocutores",
    "sp.turns": "intervenciones",
    "sp.one": "Un solo interlocutor detectado",
    "sp.short": "Texto demasiado corto.",
    "sp.moodAll": "Ánimo general",
    "sp.note":
      "No se encontró marcador de diálogo («Nombre: …»): el texto se trata como un solo autor. Use un formato «Alicia: mensaje» para el análisis por persona.",
    "sp.intervN": "intervención(es)",
    "sp.wordsN": "palabras",
    "sp.kw": "Palabras clave",
    "sp.author": "Autor",

    "ng.title": "N-gramas",
    "ng.colloc": "Colocaciones (por PMI)",
    "ng.collocDesc":
      "Coocurrencias más frecuentes de lo que predeciría el azar (información mutua puntual, palabras vacías excluidas).",
    "ng.bigram": "Bigrama",
    "ng.occ": "Oc.",
    "ng.short": "Texto demasiado corto.",
    "ng.grams": "-gramas",

    "kw.placeholder": "Palabra clave a buscar…",
    "kw.context": "Contexto",
    "kw.wordsN": "palabras",
    "kw.case": "Distinguir mayúsculas",
    "kw.occ": "ocurrencia(s)",
    "kw.none": "No se encontró ninguna ocurrencia.",
    "kw.prompt": "Escriba una palabra para verla en contexto (KWIC).",
  },
};

export const LOCALES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

export function setLocale(code) {
  if (!SUPPORTED.includes(code)) return;
  locale.value = code;
  try {
    localStorage.setItem(KEY, code);
  } catch {
    /* ignore */
  }
}

export function useI18n() {
  const t = (key) =>
    messages[locale.value]?.[key] ?? messages.fr[key] ?? key;
  return { locale: computed(() => locale.value), t, setLocale, LOCALES };
}
