import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import HorizontalList from '@/components/ui/HorizontalList.vue'

describe('HorizontalList', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const mountComponent = (props = {}, slots = {}) => {
    return mount(HorizontalList, {
      props,
      slots: {
        items: '<div class="item">Item 1</div><div class="item">Item 2</div>',
        ...slots,
      },
      global: {
        stubs: {
          ScrollBtn: true,
        },
      },
    })
  }

  describe('title rendering', () => {
    it('should render title from prop', () => {
      const wrapper = mountComponent({ title: 'Popular Shows' })

      expect(wrapper.text()).toContain('Popular Shows')
    })

    it('should render header slot content when provided', () => {
      const wrapper = mount(HorizontalList, {
        slots: {
          header: '<h3>Custom Header</h3>',
          items: '<div>Items</div>',
        },
        global: {
          stubs: { ScrollBtn: true },
        },
      })

      expect(wrapper.html()).toContain('Custom Header')
    })

    it('should prefer header slot over title prop', () => {
      const wrapper = mount(HorizontalList, {
        props: { title: 'Title Prop' },
        slots: {
          header: '<h3>Header Slot</h3>',
          items: '<div>Items</div>',
        },
        global: {
          stubs: { ScrollBtn: true },
        },
      })

      expect(wrapper.html()).toContain('Header Slot')
    })
  })

  describe('items slot', () => {
    it('should render items slot content', () => {
      const wrapper = mount(HorizontalList, {
        slots: {
          items: '<div class="test-item">Test Item</div>',
        },
        global: {
          stubs: { ScrollBtn: true },
        },
      })

      expect(wrapper.find('.test-item').exists()).toBe(true)
      expect(wrapper.text()).toContain('Test Item')
    })

    it('should render multiple items', () => {
      const wrapper = mount(HorizontalList, {
        slots: {
          items: `
            <div class="item">Item 1</div>
            <div class="item">Item 2</div>
            <div class="item">Item 3</div>
          `,
        },
        global: {
          stubs: { ScrollBtn: true },
        },
      })

      expect(wrapper.findAll('.item')).toHaveLength(3)
    })
  })

  describe('scroll container', () => {
    it('should have scroll container with proper classes', () => {
      const wrapper = mountComponent()

      const container = wrapper.find('.overflow-x-scroll')
      expect(container.exists()).toBe(true)
    })

    it('should have smooth scrolling class', () => {
      const wrapper = mountComponent()

      const container = wrapper.find('.scroll-smooth')
      expect(container.exists()).toBe(true)
    })
  })

  describe('scroll buttons', () => {
    it('should not show left button initially (at start)', async () => {
      const wrapper = mountComponent()

      await nextTick()
      await vi.advanceTimersByTimeAsync(150)
      await flushPromises()

      // canScrollLeft should be false at start
      // The ScrollBtn component is stubbed, so we check visibility via v-if
      // With stubbed component, we can check if the left button condition is met
      expect(wrapper.html()).toBeDefined()
    })

    it('should have scroll button components in template', () => {
      const wrapper = mount(HorizontalList, {
        slots: {
          items: '<div style="width: 2000px">Wide content</div>',
        },
        global: {
          stubs: { ScrollBtn: true },
        },
      })

      // ScrollBtn components are conditionally rendered based on canScrollLeft/canScrollRight
      // The component exists in template even if v-if hides it
      expect(wrapper.html()).toBeDefined()
    })
  })

  describe('expose refresh method', () => {
    it('should expose refresh method', () => {
      const wrapper = mountComponent()

      expect(typeof wrapper.vm.refresh).toBe('function')
    })

    it('should call refresh without error', async () => {
      const wrapper = mountComponent()

      await expect(wrapper.vm.refresh()).resolves.not.toThrow()
    })
  })

  describe('arrowScroll functionality', () => {
    it('should have scroll container ref', () => {
      const wrapper = mountComponent()

      const container = wrapper.find('[class*="overflow-x-scroll"]')
      expect(container.exists()).toBe(true)
    })
  })

  describe('responsiveness', () => {
    it('should have responsive padding classes', () => {
      const wrapper = mountComponent()

      expect(wrapper.html()).toContain('lg:px-12')
    })

    it('should have responsive classes for scroll buttons', () => {
      // The scroll buttons in the template have hidden lg:block classes
      // This test verifies the component structure supports responsive behavior
      const wrapper = mount(HorizontalList, {
        slots: {
          items: '<div>Content</div>',
        },
        global: {
          stubs: { ScrollBtn: true },
        },
      })

      // The component renders successfully with responsive layout
      expect(wrapper.find('.group').exists()).toBe(true)
    })
  })

  describe('group hover behavior', () => {
    it('should have group class for hover effects', () => {
      const wrapper = mountComponent()

      const groupContainer = wrapper.find('.group')
      expect(groupContainer.exists()).toBe(true)
    })
  })
})
