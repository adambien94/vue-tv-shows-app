import { ref } from 'vue'

export const activeTransitionId = ref<string | number | null>(null)

export function clearActiveTransition() {
  activeTransitionId.value = null
}
