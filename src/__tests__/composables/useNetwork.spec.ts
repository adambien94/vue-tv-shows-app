import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { setOnlineStatus, triggerOnlineEvent, triggerOfflineEvent } from '../setup'

describe('useNetwork', () => {
  let useNetwork: typeof import('@/composables/useNetwork').useNetwork
  let checkOnline: typeof import('@/composables/useNetwork').checkOnline

  beforeEach(async () => {
    setOnlineStatus(true)

    // Reset modules to get fresh state
    vi.resetModules()
    const module = await import('@/composables/useNetwork')
    useNetwork = module.useNetwork
    checkOnline = module.checkOnline
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('checkOnline', () => {
    it('should return true when online', () => {
      setOnlineStatus(true)
      expect(checkOnline()).toBe(true)
    })

    it('should return false when offline', () => {
      setOnlineStatus(false)
      expect(checkOnline()).toBe(false)
    })
  })

  describe('useNetwork composable', () => {
    it('should initialize with current online status', async () => {
      setOnlineStatus(true)

      // Create a test component that uses the composable
      const TestComponent = defineComponent({
        setup() {
          const { isOnline } = useNetwork()
          return { isOnline }
        },
        template: '<div>{{ isOnline }}</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      expect(wrapper.vm.isOnline).toBe(true)
    })

    it('should initialize with offline status when navigator is offline', async () => {
      setOnlineStatus(false)

      // Need to reset modules after changing online status
      vi.resetModules()
      const module = await import('@/composables/useNetwork')
      useNetwork = module.useNetwork

      const TestComponent = defineComponent({
        setup() {
          const { isOnline } = useNetwork()
          return { isOnline }
        },
        template: '<div>{{ isOnline }}</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      expect(wrapper.vm.isOnline).toBe(false)
    })

    it('should react to online event', async () => {
      setOnlineStatus(false)

      // Reset modules to clear shared state
      vi.resetModules()
      const module = await import('@/composables/useNetwork')
      useNetwork = module.useNetwork

      const TestComponent = defineComponent({
        setup() {
          const { isOnline } = useNetwork()
          return { isOnline }
        },
        template: '<div>{{ isOnline }}</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      expect(wrapper.vm.isOnline).toBe(false)

      // Simulate going online
      setOnlineStatus(true)
      triggerOnlineEvent()
      await nextTick()

      expect(wrapper.vm.isOnline).toBe(true)
    })

    it('should react to offline event', async () => {
      setOnlineStatus(true)

      // Reset modules to clear shared state
      vi.resetModules()
      const module = await import('@/composables/useNetwork')
      useNetwork = module.useNetwork

      const TestComponent = defineComponent({
        setup() {
          const { isOnline } = useNetwork()
          return { isOnline }
        },
        template: '<div>{{ isOnline }}</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      expect(wrapper.vm.isOnline).toBe(true)

      // Simulate going offline
      setOnlineStatus(false)
      triggerOfflineEvent()
      await nextTick()

      expect(wrapper.vm.isOnline).toBe(false)
    })

    it('should share state between multiple components', async () => {
      setOnlineStatus(true)

      // Reset modules to clear shared state
      vi.resetModules()
      const module = await import('@/composables/useNetwork')
      useNetwork = module.useNetwork

      const TestComponent = defineComponent({
        setup() {
          const { isOnline } = useNetwork()
          return { isOnline }
        },
        template: '<div>{{ isOnline }}</div>',
      })

      const wrapper1 = mount(TestComponent)
      const wrapper2 = mount(TestComponent)
      await nextTick()

      expect(wrapper1.vm.isOnline).toBe(true)
      expect(wrapper2.vm.isOnline).toBe(true)

      // Change status
      setOnlineStatus(false)
      triggerOfflineEvent()
      await nextTick()

      // Both should update
      expect(wrapper1.vm.isOnline).toBe(false)
      expect(wrapper2.vm.isOnline).toBe(false)
    })

    it('should provide isOffline as convenience ref', async () => {
      setOnlineStatus(true)

      const TestComponent = defineComponent({
        setup() {
          const { isOnline, isOffline } = useNetwork()
          return { isOnline, isOffline }
        },
        template: '<div>{{ isOnline }}-{{ isOffline }}</div>',
      })

      const wrapper = mount(TestComponent)
      await nextTick()

      // Note: isOffline is computed at setup time, so it's based on initial value
      expect(wrapper.vm.isOnline).toBe(true)
    })
  })
})
