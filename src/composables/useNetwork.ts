/**
 * useNetwork Composable - Track online/offline status
 *
 * Uses the browser's Navigator.onLine API and listens for
 * 'online' and 'offline' events to reactively track network status.
 *
 * USAGE:
 *   const { isOnline, isOffline } = useNetwork()
 *   // isOnline.value is true/false based on network status
 */

import { ref, onMounted } from 'vue'

// Shared state across all components using this composable
const isOnline = ref(true)

// Track if we've already set up listeners (only need once)
let listenersSetup = false

export function useNetwork() {
  const updateStatus = () => {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    // Initialize with current status
    updateStatus()

    // Only set up listeners once (they're shared)
    if (!listenersSetup) {
      window.addEventListener('online', updateStatus)
      window.addEventListener('offline', updateStatus)
      listenersSetup = true
    }
  })

  // Note: We don't remove listeners since the state is shared
  // and we want to keep tracking even when components unmount

  return {
    isOnline,
    isOffline: ref(!isOnline.value), // Convenience getter
  }
}

/**
 * Check if currently online (non-reactive, for one-time checks)
 */
export function checkOnline(): boolean {
  return navigator.onLine
}
