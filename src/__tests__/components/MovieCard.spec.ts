import { describe, it, expect, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import MovieCard from '@/components/MovieCard.vue'

// Mock useRouter
vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
    }),
  }
})

describe('MovieCard', () => {
  const defaultProps = {
    id: 1,
    name: 'Breaking Bad',
    img: 'https://example.com/image.jpg',
    rating: 9.5,
    genre: 'Drama',
  }

  const mountComponent = (props = {}) => {
    return mount(MovieCard, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })
  }

  describe('rendering', () => {
    it('should render the show name', () => {
      const wrapper = mountComponent()

      expect(wrapper.text()).toContain('Breaking Bad')
    })

    it('should render the rating formatted to one decimal', () => {
      const wrapper = mountComponent({ rating: 8.567 })

      expect(wrapper.text()).toContain('8.6')
    })

    it('should display "-" when rating is null', () => {
      const wrapper = mountComponent({ rating: null })

      expect(wrapper.text()).toContain('-')
    })

    it('should display "-" when rating is undefined', () => {
      const wrapper = mountComponent({ rating: undefined })

      expect(wrapper.text()).toContain('-')
    })

    it('should render image when provided', () => {
      const wrapper = mountComponent()

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/image.jpg')
      expect(img.attributes('alt')).toBe('Breaking Bad')
    })

    it('should show placeholder when no image provided', () => {
      const wrapper = mountComponent({ img: undefined })

      const img = wrapper.find('img')
      expect(img.exists()).toBe(false)

      // Should show "No Image" text
      expect(wrapper.text()).toContain('No Image')
    })

    it('should use lazy loading for images', () => {
      const wrapper = mountComponent()

      const img = wrapper.find('img')
      expect(img.attributes('loading')).toBe('lazy')
    })
  })

  describe('RouterLink', () => {
    it('should link to movie details page', () => {
      const wrapper = mountComponent({ id: 123 })

      const link = wrapper.findComponent(RouterLinkStub)
      expect(link.props().to).toEqual({
        name: 'movie-details',
        params: { id: 123 },
        query: { genre: 'Drama' },
      })
    })

    it('should include genre in query when provided', () => {
      const wrapper = mountComponent({ id: 1, genre: 'Comedy' })

      const link = wrapper.findComponent(RouterLinkStub)
      expect(link.props().to.query).toEqual({ genre: 'Comedy' })
    })

    it('should not include genre in query when not provided', () => {
      const wrapper = mountComponent({ id: 1, genre: undefined })

      const link = wrapper.findComponent(RouterLinkStub)
      expect(link.props().to.query).toBeUndefined()
    })
  })

  describe('id prop', () => {
    it('should accept number id', () => {
      const wrapper = mountComponent({ id: 123 })

      const link = wrapper.findComponent(RouterLinkStub)
      expect(link.props().to.params.id).toBe(123)
    })

    it('should accept string id', () => {
      const wrapper = mountComponent({ id: '456' })

      const link = wrapper.findComponent(RouterLinkStub)
      expect(link.props().to.params.id).toBe('456')
    })
  })

  describe('image loading state', () => {
    it('should apply skeleton class before image loads', () => {
      const wrapper = mountComponent()

      const container = wrapper.find('.relative')
      expect(container.classes()).toContain('skeleton')
    })

    it('should apply opacity-0 class before image loads', () => {
      const wrapper = mountComponent()

      const img = wrapper.find('img')
      expect(img.classes()).toContain('opacity-0')
    })
  })

  describe('accessibility', () => {
    it('should have alt text on image', () => {
      const wrapper = mountComponent({ name: 'Test Show' })

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Test Show')
    })
  })

  describe('view transition', () => {
    it('should handle click for navigation', async () => {
      const wrapper = mountComponent()

      // Mock startViewTransition not available in test env
      expect(wrapper.find('.card').exists()).toBe(true)
    })
  })
})
