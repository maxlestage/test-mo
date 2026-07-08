// Expose les analyses du document actif sous forme de valeurs réactives.
// Les calculs coûteux sont mémoïsés via `computed`.

import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCorpusStore } from "../stores/corpus.js";
import { tokenizeWords } from "../libs/text.js";
import {
  basicStats,
  frequencyDistribution,
  lexicalDiversity,
  readabilityInputs,
  wordLengthDistribution,
} from "../libs/linguistics.js";
import { analyzeSentiment } from "../libs/sentiment.js";
import { analyzeEmotions } from "../libs/emotions.js";
import { analyzeSpeakers } from "../libs/speakers.js";

export function useAnalysis() {
  const store = useCorpusStore();
  const { settings } = storeToRefs(store);

  const document = computed(() => store.activeDocument);
  const text = computed(() => document.value?.content ?? "");
  const lang = computed(() => store.resolvedLanguage);
  const hasContent = computed(() => text.value.trim().length > 0);

  const words = computed(() => tokenizeWords(text.value));

  const stats = computed(() => basicStats(text.value));

  const frequencies = computed(() =>
    frequencyDistribution(words.value, {
      lang: lang.value,
      removeStopwords: settings.value.removeStopwords,
    })
  );

  const diversity = computed(() => lexicalDiversity(words.value));

  const readability = computed(() => readabilityInputs(text.value, lang.value));

  const wordLengths = computed(() => wordLengthDistribution(words.value));

  const sentiment = computed(() => analyzeSentiment(text.value));

  const emotions = computed(() => analyzeEmotions(text.value));

  const speakers = computed(() => analyzeSpeakers(text.value));

  return {
    document,
    text,
    lang,
    hasContent,
    words,
    stats,
    frequencies,
    diversity,
    readability,
    wordLengths,
    sentiment,
    emotions,
    speakers,
    settings,
  };
}
