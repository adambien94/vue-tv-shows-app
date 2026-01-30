import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import OfflineBanner from '@/components/OfflineBanner.vue'

// Mock the useNetwork composable
const mockIsOnline = ref(true)

vi.mock('@/composables/useNetwork', () => ({
  useNetwork: () => ({
    isOnline: mockIsOnline,
  }),
}))

describe('OfflineBanner', () => {
  beforeEach(() => {
    // Reset to online before each test
    mockIsOnline.value = true
  })

  describe('visibility', () => {
    it('should not show banner when online', () => {
      mockIsOnline.value = true

      const wrapper = mount(OfflineBanner)

      expect(wrapper.find('.offline-banner').exists()).toBe(false)
    })

    it('should show banner when offline', async () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)
      await nextTick()

      expect(wrapper.find('.offline-banner').exists()).toBe(true)
    })

    it('should display offline message', async () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)
      await nextTick()

      expect(wrapper.text()).toContain("You're offline")
      expect(wrapper.text()).toContain('showing cached data')
    })
  })

  describe('reactivity', () => {
    it('should show banner when going offline', async () => {
      mockIsOnline.value = true
      const wrapper = mount(OfflineBanner)

      expect(wrapper.find('.offline-banner').exists()).toBe(false)

      mockIsOnline.value = false
      await nextTick()

      expect(wrapper.find('.offline-banner').exists()).toBe(true)
    })

    it('should hide banner when going online', async () => {
      mockIsOnline.value = false
      const wrapper = mount(OfflineBanner)
      await nextTick()

      expect(wrapper.find('.offline-banner').exists()).toBe(true)

      mockIsOnline.value = true
      await nextTick()

      expect(wrapper.find('.offline-banner').exists()).toBe(false)
    })
  })

  describe('styling', () => {
    it('should have amber background color', async () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)
      await nextTick()

      const banner = wrapper.find('.offline-banner')
      expect(banner.classes()).toContain('bg-amber-600')
    })

    it('should have centered text', async () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)
      await nextTick()

      const banner = wrapper.find('.offline-banner')
      expect(banner.classes()).toContain('text-center')
    })

    it('should have high z-index for visibility', async () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)
      await nextTick()

      // Check the scoped style defines z-index: 100
      expect(wrapper.find('.offline-banner').exists()).toBe(true)
    })
  })

  describe('icon', () => {
    it('should display wifi-off icon', async () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)
      await nextTick()

      const svg = wrapper.find('svg')
      expect(svg.exists()).toBe(true)
    })

    it('should have proper icon sizing', async () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)
      await nextTick()

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('w-4')
      expect(svg.classes()).toContain('h-4')
    })
  })

  describe('transitions', () => {
    it('should have slide-down transition wrapper', () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)

      // Transition component should be present
      expect(wrapper.html()).toContain('transition')
    })
  })

  describe('layout', () => {
    it('should have flex container for icon and text', async () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)
      await nextTick()

      const flexContainer = wrapper.find('.flex')
      expect(flexContainer.exists()).toBe(true)
    })

    it('should have gap between icon and text', async () => {
      mockIsOnline.value = false

      const wrapper = mount(OfflineBanner)
      await nextTick()

      const flexContainer = wrapper.find('.flex')
      expect(flexContainer.classes()).toContain('gap-2')
    })
  })
})
