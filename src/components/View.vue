<script setup>
import { ref, watch } from "vue";
import { useAnalysis } from "../composables/useAnalysis.js";
import { useCorpusStore } from "../stores/corpus.js";
import { useI18n } from "../i18n/index.js";
import { useNav } from "../composables/useNav.js";
import DocumentManager from "./DocumentManager.vue";
import OverviewPanel from "./panels/OverviewPanel.vue";
import FrequencyPanel from "./panels/FrequencyPanel.vue";
import DiversityPanel from "./panels/DiversityPanel.vue";
import ReadabilityPanel from "./panels/ReadabilityPanel.vue";
import NgramPanel from "./panels/NgramPanel.vue";
import ConcordancePanel from "./panels/ConcordancePanel.vue";
import SentimentPanel from "./panels/SentimentPanel.vue";
import SpeakersPanel from "./panels/SpeakersPanel.vue";
import SourceTextPanel from "./panels/SourceTextPanel.vue";
import CorpusPanel from "./panels/CorpusPanel.vue";
import SpecificitiesPanel from "./panels/SpecificitiesPanel.vue";
import ProgressionPanel from "./panels/ProgressionPanel.vue";
import ReportView from "./ReportView.vue";

const { document, hasContent } = useAnalysis();
const store = useCorpusStore();
const { t } = useI18n();
const { open, close } = useNav();

const draft = ref("");

function exportPdf() {
  window.print();
}

function analyzeDraft() {
  if (!draft.value.trim()) return;
  store.addDocument(t("mgr.pasted"), draft.value);
  draft.value = "";
}

const tabs = [
  { id: "source", key: "tabs.source", comp: SourceTextPanel },
  { id: "overview", key: "tabs.overview", comp: OverviewPanel },
  { id: "frequency", key: "tabs.frequency", comp: FrequencyPanel },
  { id: "spec", key: "tabs.spec", comp: SpecificitiesPanel },
  { id: "diversity", key: "tabs.diversity", comp: DiversityPanel },
  { id: "readability", key: "tabs.readability", comp: ReadabilityPanel },
  { id: "sentiment", key: "tabs.sentiment", comp: SentimentPanel },
  { id: "speakers", key: "tabs.speakers", comp: SpeakersPanel },
  { id: "ngram", key: "tabs.ngram", comp: NgramPanel },
  { id: "kwic", key: "tabs.kwic", comp: ConcordancePanel },
  { id: "prog", key: "tabs.prog", comp: ProgressionPanel },
  { id: "corpus", key: "tabs.corpus", comp: CorpusPanel },
];
const active = ref("overview");

// Sur mobile, refermer le tiroir dès qu'un document devient actif.
watch(
  () => document.value?.id,
  () => close()
);
</script>

<template>
  <div class="layout">
    <div v-if="open" class="backdrop" @click="close" />

    <DocumentManager :class="{ open }" />

    <main class="content">
      <template v-if="document && hasContent">
        <div class="topbar">
          <div class="doc-title">
            <h2>{{ document.name }}</h2>
            <button class="btn export-btn" @click="exportPdf">
              {{ t("view.export") }}
            </button>
          </div>
          <nav class="tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="{ on: active === tab.id }"
              @click="active = tab.id"
            >
              {{ t(tab.key) }}
            </button>
          </nav>
        </div>
        <div class="panel-wrap">
          <section class="panel">
            <component :is="tabs.find((x) => x.id === active).comp" />
          </section>
          <ReportView />
        </div>
      </template>

      <div v-else class="empty">
        <div class="empty-card">
          <h2>{{ t("view.welcome") }}</h2>
          <p>{{ t("view.welcomeDesc") }}</p>

          <div class="writer">
            <textarea
              v-model="draft"
              rows="8"
              :placeholder="t('view.placeholder')"
              @keydown.ctrl.enter="analyzeDraft"
              @keydown.meta.enter="analyzeDraft"
            />
            <div class="writer-bar">
              <span class="hint">{{ t("view.hint") }}</span>
              <button
                class="btn btn-primary"
                :disabled="!draft.trim()"
                @click="analyzeDraft"
              >
                {{ t("view.analyze") }}
              </button>
            </div>
          </div>

          <ul>
            <li>{{ t("view.feat1") }}</li>
            <li>{{ t("view.feat2") }}</li>
            <li>{{ t("view.feat3") }}</li>
            <li>{{ t("view.feat4") }}</li>
            <li>{{ t("view.feat5") }}</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex: 1;
  min-height: 0;
  position: relative;
}
.backdrop {
  display: none;
  position: absolute;
  inset: 0;
  background: #0009;
  z-index: 40;
}
.content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}
.topbar {
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--bg);
  padding: 1.5rem 2rem 0;
}
.panel-wrap {
  padding: 1.25rem 2rem 2rem;
}
.doc-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.doc-title h2 {
  font-size: 1.05rem;
  word-break: break-word;
}
.export-btn {
  flex-shrink: 0;
  font-weight: 600;
}
.export-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.tabs {
  display: flex;
  gap: 0.3rem;
  border-bottom: 1px solid var(--border);
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.tabs button {
  background: none;
  border: none;
  color: var(--text-dim);
  padding: 0.6rem 0.9rem;
  font-size: 0.85rem;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
}
.tabs button:hover {
  color: var(--text);
}
.tabs button.on {
  color: var(--accent);
  border-bottom-color: var(--accent);
  font-weight: 600;
}
.empty {
  display: grid;
  place-items: center;
  min-height: 100%;
  padding: 2rem;
}
.empty-card {
  max-width: 640px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
}
.writer {
  margin: 1.25rem 0;
}
.writer textarea {
  width: 100%;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.75rem;
  resize: vertical;
}
.writer textarea:focus {
  outline: none;
  border-color: var(--accent);
}
.writer-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.6rem;
}
.writer-bar .hint {
  font-size: 0.76rem;
  color: var(--text-dim);
}
.empty-card h2 {
  margin-bottom: 0.75rem;
}
.empty-card p {
  color: var(--text-dim);
  line-height: 1.6;
  font-size: 0.9rem;
}
.empty-card ul {
  color: var(--text-dim);
  font-size: 0.85rem;
  line-height: 1.8;
  margin: 1rem 0 0;
  padding-left: 1.1rem;
}

@media (max-width: 860px) {
  .backdrop {
    display: block;
  }
  .topbar {
    padding: 1rem 1rem 0;
  }
  .panel-wrap {
    padding: 1rem 1rem 2rem;
  }
  .empty {
    padding: 1.25rem 1rem 2rem;
  }
}
</style>
