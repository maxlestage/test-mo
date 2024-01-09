<template>
  <div class="blck">
    <ul>
      <li v-for="(item, index) in reactiveData">
        <div class="item">
          <p>{{ index }}</p>
          <p>
            {{ item.id }}
          </p>
          <p>
            {{ item.textName }}
          </p>
          <p>
            {{ item.textContent }}
          </p>
          <p>Ajout d'un nouveau mot: {{ inputText }}</p>
          <input
            v-model="inputText"
            @keyup.enter="addWords(index)"
            placeholder="edit me"
          />
        </div>
      </li>
    </ul>
    <Upload />
  </div>
</template>

<script setup>
import { reactive, ref, toRaw, watchEffect } from "vue";
import { useStore } from "../stores/files";
import Upload from "./Upload.vue";

const store = useStore("words");

const inputText = ref("");
const words = ref([]);

const getWordsSettings = (storageKey) => {
  const settings = localStorage.getItem(storageKey);
  return settings ? JSON.parse(settings) : localStorage.setItem(storageKey, []);
};

let data = getWordsSettings("words");

let refData = ref(data);
let reactiveData = reactive(refData);

console.log(" reactiveData.value : ", toRaw(reactiveData.value));

watchEffect(() => {
  localStorage.getItem("words");
  reactiveData;
});
</script>

<style scoped>
.blck {
  margin: auto;
  width: 80%;
  height: 1000px;
  border: 1px solid black;
}

.item {
  margin: auto;
  width: auto;
  border: 1px solid red;
}
</style>
