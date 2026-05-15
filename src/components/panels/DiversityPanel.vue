<script setup>
import { computed } from "vue";
import { useAnalysis } from "../../composables/useAnalysis.js";

const { diversity } = useAnalysis();

const metrics = computed(() => {
  const d = diversity.value;
  return [
    {
      name: "Tokens / Types",
      value: `${d.tokens} / ${d.types}`,
      hint: "Nombre total de mots et nombre de mots distincts.",
    },
    {
      name: "TTR (Type-Token Ratio)",
      value: d.ttr.toFixed(4),
      hint: "Types ÷ tokens. Plus c'est élevé, plus le vocabulaire est varié (sensible à la longueur du texte).",
    },
    {
      name: "Indice de Guiraud",
      value: d.guiraud.toFixed(3),
      hint: "Types ÷ √tokens. Variante du TTR moins sensible à la longueur.",
    },
    {
      name: "CTTR (corrigé)",
      value: d.cttr.toFixed(3),
      hint: "Types ÷ √(2·tokens). Type-Token Ratio corrigé de Carroll.",
    },
    {
      name: "Constante C de Herdan",
      value: d.herdanC.toFixed(4),
      hint: "log(types) ÷ log(tokens). Robuste à la taille du corpus.",
    },
    {
      name: "Indice a² de Maas",
      value: d.maas.toFixed(5),
      hint: "(log N − log V) ÷ log²N. Plus la valeur est basse, plus le texte est riche.",
    },
    {
      name: "Hapax legomena",
      value: `${d.hapax} (${(d.hapaxRatio * 100).toFixed(1)} %)`,
      hint: "Mots n'apparaissant qu'une seule fois dans le texte.",
    },
  ];
});
</script>

<template>
  <div class="diversity">
    <p class="intro">
      La richesse lexicale mesure la variété du vocabulaire employé. Plusieurs
      indices sont fournis car chacun corrige différemment l'effet de la
      longueur du texte.
    </p>
    <div class="list">
      <div v-for="m in metrics" :key="m.name" class="metric">
        <div class="head">
          <span class="name">{{ m.name }}</span>
          <span class="value">{{ m.value }}</span>
        </div>
        <p class="hint">{{ m.hint }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diversity {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.intro {
  color: var(--text-dim);
  font-size: 0.88rem;
  max-width: 70ch;
  line-height: 1.55;
}
.list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 0.85rem;
}
.metric {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.1rem;
}
.head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
.name {
  font-size: 0.88rem;
  font-weight: 600;
}
.value {
  font-family: var(--mono);
  font-size: 1.05rem;
  color: var(--accent);
  font-weight: 700;
}
.hint {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-dim);
  line-height: 1.5;
}
</style>
