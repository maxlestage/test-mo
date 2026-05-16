// État partagé du tiroir de navigation mobile (menu burger).

import { ref } from "vue";

const open = ref(false);

export function useNav() {
  return {
    open,
    toggle: () => (open.value = !open.value),
    close: () => (open.value = false),
  };
}
