// Gestion du corpus : documents, document actif, réglages d'analyse.
// L'état est persisté dans le localStorage du navigateur.

import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { tokenizeWords } from "../libs/text.js";
import { detectLanguage } from "../libs/stopwords.js";

const STORAGE_KEY = "mo-grid-corpus";

const SAMPLES = [
  {
    name: "Exemple — Le Petit Prince (extrait)",
    content: `Lorsque j'avais six ans j'ai vu, une fois, une magnifique image, dans un livre sur la forêt vierge qui s'appelait Histoires vécues. Ça représentait un serpent boa qui avalait un fauve. Voilà la copie du dessin.

On disait dans le livre : Les serpents boas avalent leur proie tout entière, sans la mâcher. Ensuite ils ne peuvent plus bouger et ils dorment pendant les six mois de leur digestion.

J'ai alors beaucoup réfléchi sur les aventures de la jungle et, à mon tour, j'ai réussi, avec un crayon de couleur, à tracer mon premier dessin. Les grandes personnes m'ont conseillé de laisser de côté les dessins de serpents boas ouverts ou fermés, et de m'intéresser plutôt à la géographie, à l'histoire, au calcul et à la grammaire.`,
  },
  {
    name: "Sample — The Road Not Taken (Frost)",
    content: `Two roads diverged in a yellow wood, and sorry I could not travel both and be one traveler, long I stood and looked down one as far as I could to where it bent in the undergrowth.

Then took the other, as just as fair, and having perhaps the better claim, because it was grassy and wanted wear; though as for that the passing there had worn them really about the same.

I shall be telling this with a sigh somewhere ages and ages hence: two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference.`,
  },
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export const useCorpusStore = defineStore("corpus", {
  state: () => {
    const saved = load();
    return {
      documents: saved?.documents ?? [],
      activeId: saved?.activeId ?? null,
      settings: {
        language: saved?.settings?.language ?? "auto",
        removeStopwords: saved?.settings?.removeStopwords ?? false,
      },
    };
  },

  getters: {
    activeDocument(state) {
      return state.documents.find((d) => d.id === state.activeId) || null;
    },
    resolvedLanguage(state) {
      if (state.settings.language !== "auto") return state.settings.language;
      const doc = state.documents.find((d) => d.id === state.activeId);
      if (!doc) return "fr";
      return detectLanguage(tokenizeWords(doc.content).slice(0, 800));
    },
  },

  actions: {
    persist() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            documents: this.documents,
            activeId: this.activeId,
            settings: this.settings,
          })
        );
      } catch {
        /* quota dépassé : on ignore silencieusement */
      }
    },

    addDocument(name, content) {
      const trimmed = (content || "").trim();
      if (!trimmed) return null;
      const existing = this.documents.find((d) => d.name === name);
      const doc = {
        id: existing?.id ?? uuidv4(),
        name: name || `Document ${this.documents.length + 1}`,
        content: trimmed,
        addedAt: Date.now(),
      };
      if (existing) {
        Object.assign(existing, doc);
      } else {
        this.documents.push(doc);
      }
      this.activeId = doc.id;
      this.persist();
      return doc.id;
    },

    removeDocument(id) {
      this.documents = this.documents.filter((d) => d.id !== id);
      if (this.activeId === id) {
        this.activeId = this.documents[0]?.id ?? null;
      }
      this.persist();
    },

    setActive(id) {
      this.activeId = id;
      this.persist();
    },

    clearAll() {
      this.documents = [];
      this.activeId = null;
      this.persist();
    },

    updateSettings(patch) {
      Object.assign(this.settings, patch);
      this.persist();
    },

    loadSamples() {
      for (const s of SAMPLES) this.addDocument(s.name, s.content);
    },
  },
});
