<script setup>
import { ref } from "vue";
import { useCorpusStore } from "../stores/corpus.js";

const store = useCorpusStore();
const active = ref(false);
const fileInput = ref(null);

function readFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsText(file);
  });
}

// Tout format est accepté : le contenu est lu comme texte. Les
// balises HTML/XML sont retirées pour ne garder que le texte utile.
function toText(name, raw) {
  const isMarkup =
    /\.(html?|xml|svg|xhtml)$/i.test(name) || /^\s*<(!doctype|html|\?xml)/i.test(raw);
  if (!isMarkup) return raw;
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

async function ingest(files) {
  for (const file of files) {
    const raw = await readFile(file);
    const content = toText(file.name, raw);
    if (content.trim()) store.addDocument(file.name, content);
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
      hidden
      @change="onPick"
    />
    <strong>Déposer des fichiers ici</strong>
    <span>ou cliquer pour parcourir · tous formats texte</span>
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
  cursor: pointer;
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
