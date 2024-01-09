// Importer les modules nécessaires depuis les bibliothèques Pinia et Vue.js.
import { defineStore } from "pinia";
import { ref, toRaw } from "vue";

// Définir une fonction pour obtenir les paramètres par défaut.
const getDefaultTextsSettings = () => {
  return [];
};

// Définir une fonction pour obtenir les paramètres du stockage local.
const getTextsSettings = (storageKey) => {
  // Obtenir les paramètres du stockage local.
  const settings = localStorage.getItem(storageKey);
  // Si les paramètres existent, les analyser depuis une chaîne JSON.
  return settings ? JSON.parse(settings) : getDefaultTextsSettings();
};

// Définir une fonction pour obtenir les paramètres de mots par défaut.
const getDefaultWordsSettings = () => {
  return [];
};

// Définir une fonction pour obtenir les paramètres de mots à partir du stockage local.
const getWordsSettings = (storageKey) => {
  const settings = localStorage.getItem(storageKey);
  return settings ? JSON.parse(settings) : getDefaultWordsSettings();
};

// Fonction utilitaire pour mettre à jour les données.
function tryToUpdate(oldData, newData) {
  let updatedDb = [...oldData];

  // Rechercher l'index de l'élément existant avec le même nom de texte.
  const existingIndex = updatedDb.findIndex(
    (data) => data.textName === newData.textName
  );

  // Si l'élément existe, le mettre à jour, sinon l'ajouter.
  if (existingIndex !== -1) {
    updatedDb[existingIndex] = newData;
  } else {
    updatedDb.push(newData);
  }

  return updatedDb;
}

// Fonction pour créer et retourner un magasin Pinia.
export function useStore(storageKey) {
  return defineStore(storageKey, {
    // Définir l'état du magasin.
    state: () => ({
      // Définir l'état initial des paramètres de texte et de mots en utilisant ref().
      UseCaseTextsSettings: ref(getTextsSettings(storageKey)),
      UseCaseWordsSettings: ref(getWordsSettings(storageKey)),
    }),

    // Définir les actions du magasin.
    actions: {
      // Action pour mettre à jour les paramètres de texte.
      textUpdateUseCaseSettings(partialUseCaseTextsSettings) {
        // Si les paramètres sont indéfinis ou vides, les définir sur les paramètres partiels.
        if (
          this.UseCaseTextsSettings === undefined ||
          this.UseCaseTextsSettings.length < 1
        ) {
          this.UseCaseTextsSettings = [partialUseCaseTextsSettings];
        } else {
          // Obtenir une copie des anciens paramètres.
          const oldUseCaseTextsSettings = structuredClone(
            toRaw(this.UseCaseTextsSettings)
          );

          // Ajouter les paramètres partiels aux anciens paramètres.
          this.UseCaseTextsSettings = tryToUpdate(
            oldUseCaseTextsSettings,
            partialUseCaseTextsSettings
          );
        }

        // Sauvegarder les paramètres dans le stockage local.
        localStorage.setItem(
          storageKey,
          JSON.stringify(this.UseCaseTextsSettings)
        );
      },

      // Action pour mettre à jour les paramètres de mots.
      wordUpdateUseCaseSettings(partialUseCaseWordsSettings) {
        // Si les paramètres sont indéfinis ou vides, les définir sur les paramètres partiels.
        if (
          this.UseCaseWordsSettings === undefined ||
          this.UseCaseWordsSettings.length < 1
        ) {
          this.UseCaseWordsSettings = [partialUseCaseWordsSettings];
        } else {
          // Obtenir une copie des anciens paramètres.
          const oldUseCaseWordsSettings = structuredClone(
            toRaw(this.UseCaseWordsSettings)
          );

          // Ajouter les paramètres partiels aux anciens paramètres.
          this.UseCaseWordsSettings = tryToUpdate(
            oldUseCaseWordsSettings,
            partialUseCaseWordsSettings
          );
        }

        // Sauvegarder les paramètres dans le stockage local.
        localStorage.setItem(
          storageKey,
          JSON.stringify(this.UseCaseWordsSettings)
        );
      },
    },
  })();
}
