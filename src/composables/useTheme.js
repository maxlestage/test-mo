// Thème clair / sombre, persisté dans le localStorage et appliqué
// via l'attribut data-theme sur <html>.

import { ref, watch } from "vue";

const KEY = "mo-grid-theme";

function read() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* localStorage indisponible */
  }
  return "dark";
}

const theme = ref(read());

function apply(value) {
  document.documentElement.setAttribute("data-theme", value);
}

apply(theme.value);

watch(theme, (value) => {
  apply(value);
  try {
    localStorage.setItem(KEY, value);
  } catch {
    /* quota / mode privé : on ignore */
  }
});

export function useTheme() {
  function toggle() {
    theme.value = theme.value === "dark" ? "light" : "dark";
  }
  return { theme, toggle };
}
