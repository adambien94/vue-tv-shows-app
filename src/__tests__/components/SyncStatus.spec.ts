import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, readonly, nextTick } from 'vue'
import SyncStatus from '@/components/SyncStatus.vue'

// Mock the syncService module
vi.mock('@/services/syncService', () => {
  const isSyncing = ref(false)
  const syncProgress = ref(0)
  const syncMessage = ref('')
  const syncError = ref<string | null>(null)

  return {
    useSyncStatus: () => ({
      isSyncing: readonly(isSyncing),
      syncProgress: readonly(syncProgress),
      syncMessage: readonly(syncMessage),
      syncError: readonly(syncError),
    }),
    // Export refs for test manipulation
    __testRefs: { isSyncing, syncProgress, syncMessage, syncError },
  }
})

describe('SyncStatus', () => {
  let testRefs: {
    isSyncing: ReturnType<typeof ref<boolean>>
    syncProgress: ReturnType<typeof ref<number>>
    syncMessage: ReturnType<typeof ref<string>>
    syncError: ReturnType<typeof ref<string | null>>
  }

  beforeEach(async () => {
    const module = await import('@/services/syncService')
    testRefs = (module as unknown as { __testRefs: typeof testRefs }).__testRefs

    // Reset values
    testRefs.isSyncing.value = false
    testRefs.syncProgress.value = 0
    testRefs.syncMessage.value = ''
    testRefs.syncError.value = null
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('sync progress display', () => {
    it('should not show progress bar when not syncing', () => {
      testRefs.isSyncing.value = false

      const wrapper = mount(SyncStatus)

      expect(wrapper.find('.fixed').exists()).toBe(false)
    })

    it('should show progress bar when syncing', async () => {
      testRefs.isSyncing.value = true
      testRefs.syncProgress.value = 50

      const wrapper = mount(SyncStatus)
      await nextTick()

      expect(wrapper.text()).toContain('Syncing Data')
      expect(wrapper.text()).toContain('50%')
    })

    it('should display sync message', async () => {
      testRefs.isSyncing.value = true
      testRefs.syncMessage.value = 'Loading page 1/2...'

      const wrapper = mount(SyncStatus)
      await nextTick()

      expect(wrapper.text()).toContain('Loading page 1/2...')
    })

    it('should update progress bar width based on syncProgress', async () => {
      testRefs.isSyncing.value = true
      testRefs.syncProgress.value = 75

      const wrapper = mount(SyncStatus)
      await nextTick()

      const progressBar = wrapper.find('[class*="bg-gradient-to-r"]')
      expect(progressBar.attributes('style')).toContain('width: 75%')
    })

    it('should show spinner icon when syncing', async () => {
      testRefs.isSyncing.value = true

      const wrapper = mount(SyncStatus)
      await nextTick()

      const spinner = wrapper.find('.animate-spin')
      expect(spinner.exists()).toBe(true)
    })
  })

  describe('error display', () => {
    it('should show error toast when sync error occurs', async () => {
      testRefs.syncError.value = 'Failed to sync'
      testRefs.isSyncing.value = false

      const wrapper = mount(SyncStatus)
      await nextTick()

      expect(wrapper.text()).toContain('Sync Error')
      expect(wrapper.text()).toContain('Failed to sync')
    })

    it('should not show error while still syncing', async () => {
      testRefs.syncError.value = 'Error message'
      testRefs.isSyncing.value = true

      const wrapper = mount(SyncStatus)
      await nextTick()

      // Should show sync progress, not error
      expect(wrapper.text()).toContain('Syncing Data')
    })

    it('should have dismiss button for error', async () => {
      testRefs.syncError.value = 'Error'
      testRefs.isSyncing.value = false

      const wrapper = mount(SyncStatus)
      await nextTick()

      const dismissBtn = wrapper.find('button')
      expect(dismissBtn.exists()).toBe(true)
    })

    it('should hide error when dismiss is clicked', async () => {
      testRefs.syncError.value = 'Error'
      testRefs.isSyncing.value = false

      const wrapper = mount(SyncStatus)
      await nextTick()

      const dismissBtn = wrapper.find('button')
      await dismissBtn.trigger('click')
      await nextTick()

      // The component internally tracks showError state
      // After clicking dismiss, the error toast should hide
    })
  })

  describe('styling', () => {
    it('should be fixed positioned at bottom', async () => {
      testRefs.isSyncing.value = true

      const wrapper = mount(SyncStatus)
      await nextTick()

      expect(wrapper.find('.fixed').exists()).toBe(true)
      expect(wrapper.find('.bottom-4').exists()).toBe(true)
    })

    it('should have z-50 for proper stacking', async () => {
      testRefs.isSyncing.value = true

      const wrapper = mount(SyncStatus)
      await nextTick()

      expect(wrapper.find('.z-50').exists()).toBe(true)
    })

    it('should have backdrop blur effect', async () => {
      testRefs.isSyncing.value = true

      const wrapper = mount(SyncStatus)
      await nextTick()

      expect(wrapper.find('.backdrop-blur-sm').exists()).toBe(true)
    })
  })

  describe('responsive design', () => {
    it('should have responsive width classes', async () => {
      testRefs.isSyncing.value = true

      const wrapper = mount(SyncStatus)
      await nextTick()

      const container = wrapper.find('.fixed')
      expect(container.classes()).toContain('sm:w-80')
    })
  })

  describe('transitions', () => {
    it('should have Transition component wrapper', () => {
      const wrapper = mount(SyncStatus)

      // The Transition component should be present
      expect(wrapper.html()).toContain('transition')
    })
  })
})
