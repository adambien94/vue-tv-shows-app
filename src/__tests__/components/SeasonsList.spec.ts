import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SeasonsList from '@/components/movie/SeasonsList.vue'
import { createMockSeason, createMockSeasons } from '../setup'

describe('SeasonsList', () => {
  const mountComponent = (seasons = createMockSeasons(3), loading = false) => {
    return mount(SeasonsList, {
      props: { seasons, loading },
      global: {
        stubs: {
          HorizontalList: {
            template: '<div class="horizontal-list-stub"><slot name="header" /><slot name="items" /></div>',
          },
          ScrollBtn: true,
        },
      },
    })
  }

  describe('visibility', () => {
    it('should not render when seasons array is empty and not loading', () => {
      const wrapper = mountComponent([], false)

      expect(wrapper.find('.horizontal-list-stub').exists()).toBe(false)
    })

    it('should render when seasons are provided', () => {
      const wrapper = mountComponent(createMockSeasons(3))

      expect(wrapper.find('.horizontal-list-stub').exists()).toBe(true)
    })

    it('should render when loading even with empty seasons', () => {
      const wrapper = mountComponent([], true)

      expect(wrapper.find('.horizontal-list-stub').exists()).toBe(true)
    })
  })

  describe('loading skeleton', () => {
    it('should show skeleton card when loading', () => {
      const wrapper = mountComponent([], true)

      const skeletonCard = wrapper.find('.season-card')
      expect(skeletonCard.exists()).toBe(true)
      expect(skeletonCard.find('.animate-pulse').exists()).toBe(true)
    })

    it('should show skeleton header when loading', () => {
      const wrapper = mountComponent([], true)

      const skeletonHeader = wrapper.find('h2 .animate-pulse')
      expect(skeletonHeader.exists()).toBe(true)
    })

    it('should not show skeleton when data is loaded', () => {
      const wrapper = mountComponent(createMockSeasons(3), false)

      const pulseElements = wrapper.findAll('.animate-pulse')
      expect(pulseElements).toHaveLength(0)
    })
  })

  describe('header', () => {
    it('should display correct season count - singular', () => {
      const wrapper = mountComponent([createMockSeason({ number: 1 })])

      expect(wrapper.text()).toContain('1 Season')
    })

    it('should display correct season count - plural', () => {
      const wrapper = mountComponent(createMockSeasons(5))

      expect(wrapper.text()).toContain('5 Seasons')
    })
  })

  describe('season cards', () => {
    it('should render a card for each season', () => {
      const wrapper = mountComponent(createMockSeasons(4))

      const seasonCards = wrapper.findAll('.season-card')
      expect(seasonCards).toHaveLength(4)
    })

    it('should display season number', () => {
      const wrapper = mountComponent([createMockSeason({ number: 3 })])

      expect(wrapper.text()).toContain('Season 3')
    })

    it('should display episode count when available', () => {
      const wrapper = mountComponent([createMockSeason({ number: 1, episodeOrder: 12 })])

      expect(wrapper.text()).toContain('12 episodes')
    })

    it('should not display episode count when not available', () => {
      const wrapper = mountComponent([createMockSeason({ number: 1, episodeOrder: undefined })])

      expect(wrapper.text()).not.toContain('episodes')
    })
  })

  describe('season images', () => {
    it('should display season image when available', () => {
      const season = createMockSeason({
        image: { medium: 'https://example.com/season.jpg', original: 'https://example.com/season-full.jpg' },
      })
      const wrapper = mountComponent([season])

      const img = wrapper.find('img')
      expect(img.exists()).toBe(true)
      expect(img.attributes('src')).toBe('https://example.com/season.jpg')
    })

    it('should prefer medium image over original', () => {
      const season = createMockSeason({
        image: { medium: 'https://example.com/medium.jpg', original: 'https://example.com/original.jpg' },
      })
      const wrapper = mountComponent([season])

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/medium.jpg')
    })

    it('should use original image if medium not available', () => {
      const season = createMockSeason({
        image: { medium: '', original: 'https://example.com/original.jpg' },
      })
      const wrapper = mountComponent([season])

      const img = wrapper.find('img')
      expect(img.attributes('src')).toBe('https://example.com/original.jpg')
    })

    it('should show gradient placeholder when no image', () => {
      const season = createMockSeason({ image: undefined })
      const wrapper = mountComponent([season])

      const img = wrapper.find('img')
      expect(img.exists()).toBe(false)

      const placeholder = wrapper.find('.bg-gradient-to-br')
      expect(placeholder.exists()).toBe(true)
    })
  })

  describe('large season number overlay', () => {
    it('should display large season number as overlay', () => {
      const wrapper = mountComponent([createMockSeason({ number: 5 })])

      // The large number should be in the top-left corner
      const overlay = wrapper.find('.absolute.top-3.left-3')
      expect(overlay.exists()).toBe(true)
      expect(overlay.text()).toContain('5')
    })

    it('should have large font size for overlay number', () => {
      const wrapper = mountComponent([createMockSeason({ number: 1 })])

      const number = wrapper.find('.text-5xl')
      expect(number.exists()).toBe(true)
    })
  })

  describe('lazy loading', () => {
    it('should use lazy loading for season images', () => {
      const season = createMockSeason({
        image: { medium: 'https://example.com/season.jpg', original: '' },
      })
      const wrapper = mountComponent([season])

      const img = wrapper.find('img')
      expect(img.attributes('loading')).toBe('lazy')
    })
  })

  describe('alt text', () => {
    it('should have descriptive alt text', () => {
      const season = createMockSeason({
        number: 3,
        image: { medium: 'https://example.com/season.jpg', original: '' },
      })
      const wrapper = mountComponent([season])

      const img = wrapper.find('img')
      expect(img.attributes('alt')).toBe('Season 3')
    })
  })

  describe('responsiveness', () => {
    it('should have responsive card sizing', () => {
      const wrapper = mountComponent(createMockSeasons(2))

      const card = wrapper.find('.season-card .relative')
      expect(card.classes()).toContain('w-32')
      expect(card.classes()).toContain('lg:w-48')
    })

    it('should have responsive border radius', () => {
      const wrapper = mountComponent(createMockSeasons(2))

      const card = wrapper.find('.season-card .relative')
      expect(card.classes()).toContain('rounded-lg')
      expect(card.classes()).toContain('lg:rounded-2xl')
    })
  })
})
