<script setup>
import { ref } from "vue";
import { useCorpusStore } from "../stores/corpus.js";

const store = useCorpusStore();
const active = ref(false);
const fileInput = ref(null);

const ACCEPT = [".txt", ".md", ".text", ".csv"];

function accepted(name) {
  return ACCEPT.some((ext) => name.toLowerCase().endsWith(ext));
}

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

async function ingest(files) {
  for (const file of files) {
    if (!accepted(file.name)) continue;
    const content = await readFile(file);
    store.addDocument(file.name, content);
  }
}

async function onDrop(e) {
  active.value = false;
  await ingest([...e.dataTransfer.files]);
}

async function onPick(e) {
  await ingest([...e.target.files]);
  e.target.value = "";
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ active }"
    @dragenter.prevent="active = true"
    @dragover.prevent="active = true"
    @dragleave.prevent="active = false"
    @drop.prevent="onDrop"
    @click="fileInput.click()"
  >
    <input
      ref="fileInput"
      type="file"
      multiple
      accept=".txt,.md,.text,.csv"
      hidden
      @change="onPick"
    />
    <strong>Déposer des fichiers ici</strong>
    <span>ou cliquer pour parcourir · .txt .md .csv</span>
  </div>
</template>

<style scoped>
.dropzone {
  border: 1.5px dashed var(--border);
  border-radius: var(--radius);
  padding: 1.1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--text-dim);
  transition: border-color 0.15s, background 0.15s;
}
.dropzone:hover {
  border-color: var(--accent);
}
.dropzone.active {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.dropzone strong {
  color: var(--text);
  font-size: 0.9rem;
}
.dropzone span {
  font-size: 0.75rem;
}
</style>
