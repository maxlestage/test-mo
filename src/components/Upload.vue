<template>
  <div
    :data-active="active"
    :class="{ dropzone: true, dragging: dragging }"
    class="dropzoneround"
    @dragenter.prevent="setActive"
    @dragover.prevent="setActive"
    @drop.prevent="onDrop"
    @dragover.native="onDragOver"
  >
    <slot :dropZoneActive="active"></slot>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
// import parseCSV from "../libs/parseCSV";
import { useStore } from "../stores/files";
import { v4 as uuidv4 } from "uuid";
const store = useStore("words");

const emit = defineEmits(["files-dropped"]);

let dragging = ref(false);
let active = ref(false);
let inActiveTimeout = null;

function setActive() {
  dragging.value = true;
  active.value = true;
  clearTimeout(inActiveTimeout);
}

function onDragOver(e) {
  e.dataTransfer.dropEffect = "copy";
  e.preventDefault();
}

function setInactive() {
  inActiveTimeout = setTimeout(() => {
    active.value = false;
    dragging.value = false;
  }, 10);
}

let fileName = "";
let fileTextContent = "";

async function onDrop(e) {
  setInactive();
  const files = [...e.dataTransfer.files];
  emit("files-dropped", files);

  const reader = new FileReader();

  reader.onloadend = () => {
    fileTextContent = reader.result;

    fileName = files[0].name;

    let addNewData = {
      id: uuidv4(),
      textName: fileName,
      textContent: fileTextContent,
    };

    // if (fileName.endsWith(".csv")) {
    //   let test = parseCSV(fileTextContent);
    // }

    if (fileName.endsWith(".txt")) {
      store.textUpdateUseCaseSettings(addNewData);
      store.wordUpdateUseCaseSettings(addNewData);
    }
  };

  reader.readAsText(files[0]);
}

function preventDefaults(e) {
  e.preventDefault();
}

const events = ["dragenter", "dragover", "dragleave", "drop"];

onMounted(() => {
  events.forEach((eventName) => {
    document.body.addEventListener(eventName, preventDefaults);
  });
});

onUnmounted(() => {
  events.forEach((eventName) => {
    document.body.removeEventListener(eventName, preventDefaults);
  });
});
</script>

<style scoped>
.dropzoneround {
  z-index: 10;
  box-shadow: #00000046 -3px 5px 13px 0px, #0000002e 0px 0px 0px 1px;
  margin-top: 3vw !important;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border-radius: 100%;
  background-color: #f16e00;
  /* padding: 20px; */
  padding: 0px;
  box-sizing: border-box;
  float: left;
  position: absolute;
  bottom: 0;
  margin-bottom: 43px;
  margin-left: 25px;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
</style>
