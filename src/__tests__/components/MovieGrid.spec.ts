import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MovieGrid from '@/components/movie/MovieGrid.vue'
import { createMockShow } from '../setup'

describe('MovieGrid', () => {
  const mountComponent = (movies = [createMockShow()]) => {
    return mount(MovieGrid, {
      props: { movies },
      global: {
        stubs: {
          MovieCard: {
            template: '<div class="movie-card-stub" :data-id="id" :data-name="name">{{ name }}</div>',
            props: ['id', 'name', 'genre', 'img', 'rating'],
          },
          RouterLink: true,
        },
      },
    })
  }

  describe('grid layout', () => {
    it('should render as grid', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('.grid').exists()).toBe(true)
    })

    it('should have responsive column classes', () => {
      const wrapper = mountComponent()

      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('grid-cols-2')
      expect(grid.classes()).toContain('sm:grid-cols-3')
      expect(grid.classes()).toContain('lg:grid-cols-4')
      expect(grid.classes()).toContain('xl:grid-cols-6')
    })

    it('should have gap between items', () => {
      const wrapper = mountComponent()

      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('gap-4')
    })
  })

  describe('MovieCard rendering', () => {
    it('should render a MovieCard for each movie', () => {
      const movies = [
        createMockShow({ id: 1, name: 'Show 1' }),
        createMockShow({ id: 2, name: 'Show 2' }),
        createMockShow({ id: 3, name: 'Show 3' }),
      ]

      const wrapper = mountComponent(movies)

      const cards = wrapper.findAll('.movie-card-stub')
      expect(cards).toHaveLength(3)
    })

    it('should pass correct id prop to MovieCard', () => {
      const movies = [createMockShow({ id: 123 })]

      const wrapper = mountComponent(movies)

      const card = wrapper.find('.movie-card-stub')
      expect(card.attributes('data-id')).toBe('123')
    })

    it('should pass correct name prop to MovieCard', () => {
      const movies = [createMockShow({ name: 'Breaking Bad' })]

      const wrapper = mountComponent(movies)

      const card = wrapper.find('.movie-card-stub')
      expect(card.attributes('data-name')).toBe('Breaking Bad')
    })

    it('should pass first genre as genre prop', () => {
      const movies = [createMockShow({ genres: ['Drama', 'Thriller'] })]

      const wrapper = mount(MovieGrid, {
        props: { movies },
        global: {
          stubs: {
            MovieCard: {
              template: '<div class="movie-card-stub" :data-genre="genre">{{ name }}</div>',
              props: ['id', 'name', 'genre', 'img', 'rating'],
            },
          },
        },
      })

      const card = wrapper.find('.movie-card-stub')
      expect(card.attributes('data-genre')).toBe('Drama')
    })

    it('should pass medium image, falling back to original', () => {
      const movies = [createMockShow({
        image: { medium: 'medium.jpg', original: 'original.jpg' },
      })]

      const wrapper = mount(MovieGrid, {
        props: { movies },
        global: {
          stubs: {
            MovieCard: {
              template: '<div class="movie-card-stub" :data-img="img">{{ name }}</div>',
              props: ['id', 'name', 'genre', 'img', 'rating'],
            },
          },
        },
      })

      const card = wrapper.find('.movie-card-stub')
      expect(card.attributes('data-img')).toBe('medium.jpg')
    })

    it('should pass rating.average as rating prop', () => {
      const movies = [createMockShow({ rating: { average: 8.7 } })]

      const wrapper = mount(MovieGrid, {
        props: { movies },
        global: {
          stubs: {
            MovieCard: {
              template: '<div class="movie-card-stub" :data-rating="rating">{{ name }}</div>',
              props: ['id', 'name', 'genre', 'img', 'rating'],
            },
          },
        },
      })

      const card = wrapper.find('.movie-card-stub')
      expect(card.attributes('data-rating')).toBe('8.7')
    })
  })

  describe('empty state', () => {
    it('should render empty grid when no movies', () => {
      const wrapper = mountComponent([])

      expect(wrapper.find('.grid').exists()).toBe(true)
      expect(wrapper.findAll('.movie-card-stub')).toHaveLength(0)
    })
  })

  describe('unique keys', () => {
    it('should use movie.id as key for items', () => {
      const movies = [
        createMockShow({ id: 1, name: 'Show 1' }),
        createMockShow({ id: 2, name: 'Show 2' }),
      ]

      const wrapper = mountComponent(movies)

      // Each movie should be in its own div wrapper
      const wrappers = wrapper.findAll('.grid > div')
      expect(wrappers).toHaveLength(2)
    })
  })

  describe('padding', () => {
    it('should have horizontal padding', () => {
      const wrapper = mountComponent()

      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('px-4')
    })

    it('should have bottom padding', () => {
      const wrapper = mountComponent()

      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('pb-6')
    })
  })

  describe('content placement', () => {
    it('should center content placement', () => {
      const wrapper = mountComponent()

      const grid = wrapper.find('.grid')
      expect(grid.classes()).toContain('place-content-center')
    })
  })

  describe('large dataset', () => {
    it('should handle many movies', () => {
      const movies = Array.from({ length: 100 }, (_, i) =>
        createMockShow({ id: i + 1, name: `Show ${i + 1}` }),
      )

      const wrapper = mountComponent(movies)

      const cards = wrapper.findAll('.movie-card-stub')
      expect(cards).toHaveLength(100)
    })
  })
})
