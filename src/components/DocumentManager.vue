<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useCorpusStore } from "../stores/corpus.js";
import { useI18n } from "../i18n/index.js";
import Upload from "./Upload.vue";

const store = useCorpusStore();
const { documents, activeId, settings } = storeToRefs(store);
const { t } = useI18n();

const pasteName = ref("");
const pasteText = ref("");
const showPaste = ref(false);

function addPasted() {
  if (!pasteText.value.trim()) return;
  store.addDocument(pasteName.value.trim() || t("mgr.pasted"), pasteText.value);
  pasteName.value = "";
  pasteText.value = "";
  showPaste.value = false;
}
</script>

<template>
  <aside class="manager">
    <section>
      <h2>{{ t("mgr.corpus") }}</h2>
      <ul v-if="documents.length" class="doc-list">
        <li
          v-for="doc in documents"
          :key="doc.id"
          :class="{ selected: doc.id === activeId }"
          @click="store.setActive(doc.id)"
        >
          <span class="doc-name" :title="doc.name">{{ doc.name }}</span>
          <button
            class="del"
            :title="t('mgr.delete')"
            @click.stop="store.removeDocument(doc.id)"
          >
            ✕
          </button>
        </li>
      </ul>
      <p v-else class="muted">{{ t("mgr.empty") }}</p>
    </section>

    <section class="actions">
      <Upload />
      <button class="btn btn-ghost" @click="showPaste = !showPaste">
        {{ showPaste ? t("mgr.cancel") : t("mgr.paste") }}
      </button>
      <div v-if="showPaste" class="paste">
        <input v-model="pasteName" :placeholder="t('mgr.namePh')" />
        <textarea
          v-model="pasteText"
          rows="6"
          :placeholder="t('mgr.textPh')"
        />
        <button class="btn btn-primary" @click="addPasted">
          {{ t("mgr.add") }}
        </button>
      </div>
      <div class="row-btns">
        <button class="btn btn-ghost" @click="store.loadSamples()">
          {{ t("mgr.samples") }}
        </button>
        <button
          v-if="documents.length"
          class="btn btn-ghost"
          @click="store.clearAll()"
        >
          {{ t("mgr.clear") }}
        </button>
      </div>
    </section>

    <section>
      <h2>{{ t("mgr.settings") }}</h2>
      <label class="field">
        <span>{{ t("mgr.analysisLang") }}</span>
        <select
          :value="settings.language"
          @change="store.updateSettings({ language: $event.target.value })"
        >
          <option value="auto">{{ t("mgr.auto") }}</option>
          <option value="fr">{{ t("mgr.fr") }}</option>
          <option value="en">{{ t("mgr.en") }}</option>
        </select>
      </label>
      <label class="check">
        <input
          type="checkbox"
          :checked="settings.removeStopwords"
          @change="store.updateSettings({ removeStopwords: $event.target.checked })"
        />
        <span>{{ t("mgr.removeStop") }}</span>
      </label>
    </section>
  </aside>
</template>

<style scoped>
.manager {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.25rem;
  width: 290px;
  border-right: 1px solid var(--border);
  background: var(--surface);
  overflow-y: auto;
}
h2 {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim);
  margin-bottom: 0.7rem;
}
.doc-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.doc-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  font-size: 0.82rem;
  cursor: pointer;
}
.doc-list li:hover {
  border-color: var(--accent);
}
.doc-list li.selected {
  background: var(--accent-soft);
  border-color: var(--accent);
}
.doc-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.del {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 0.8rem;
}
.del:hover {
  color: var(--hard);
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.paste {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.paste input,
.paste textarea,
.field select {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 7px;
  color: var(--text);
  padding: 0.5rem;
  font-size: 0.82rem;
  font-family: inherit;
  width: 100%;
  resize: vertical;
}
.row-btns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.82rem;
  margin-bottom: 0.8rem;
}
.check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  cursor: pointer;
}
.muted {
  color: var(--text-dim);
  font-size: 0.82rem;
}

@media (max-width: 860px) {
  .manager {
    position: absolute;
    inset: 0 auto 0 0;
    width: min(86vw, 320px);
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    z-index: 50;
    box-shadow: 6px 0 28px #000a;
  }
  .manager.open {
    transform: none;
  }
}
</style>
