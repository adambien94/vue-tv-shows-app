export type Movie = {
  id: string
  title: string
  img: string
  year?: string
  overview?: string
  voteCount?: number
  rating?: number
  genres?: string[]
}

export const movies: Movie[] = [
  {
    id: 'breaking-bad',
    title: 'Breaking Bad',
    img: 'https://cdn1.naekranie.pl/media/cache/amp/2014/12/breaking-bad-1.jpg',
    year: '2008',
    genres: ['Drama', 'Crime'],
    rating: 9.5,
    voteCount: 839,
    overview:
      'A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future.',
  },
  {
    id: 'harry-potter',
    title: 'Harry Potter',
    img: 'https://media.posterstore.com/site_images/68631db092c536b9cc92b06f_775081888_WB0101-5.jpg',
    year: '2001',
    genres: ['Fantasy', 'Adventure'],
    rating: 8.1,
    voteCount: 839,
    overview:
      'An orphaned boy discovers he’s a wizard and attends Hogwarts School of Witchcraft and Wizardry. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future.',
  },
  {
    id: 'fast-and-furious',
    title: 'Fast and Furious',
    img: 'https://play-lh.googleusercontent.com/5WZEffr_t4UHJGD2H9YxJiVoUnV8jA_DztRtdwkZpC4pJdk8ZIjOkMmabtJyaHPFM8Wp',
    year: '2001',
    genres: ['Action', 'Thriller'],
    rating: 7.2,
    voteCount: 839,
    overview:
      'Street racing and heists collide when an undercover cop infiltrates a notorious crew. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future.',
  },
  {
    id: 'epic-movie',
    title: 'Epic Movie',
    img: 'https://m.media-amazon.com/images/I/81OQQZ8PZdL.jpg',
    year: '2001',
    genres: ['Action', 'Thriller'],
    rating: 7.2,
    voteCount: 839,
    overview:
      'Street racing and heists collide when an undercover cop infiltrates a notorious crew. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future.',
  },
  {
    id: 'elio',
    title: 'Elio',
    img: 'https://moviemom.com/wp-content/uploads/2025/06/p_studio_elio_payoff_poster_v1_b71992a8.jpeg',
    year: '2001',
    genres: ['Action', 'Thriller'],
    rating: 7.2,
    voteCount: 839,
    overview:
      'Street racing and heists collide when an undercover cop infiltrates a notorious crew. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future.',
  },
  {
    id: 'slasher',
    title: 'Slasher',
    img: 'https://english.cdn.zeenews.com/sites/default/files/2025/01/08/1628146-i-m-tall-when-i-m-young-and-i-m-short-when-i-m-old.what-am-i-89.jpg',
    year: '2001',
    genres: ['Action', 'Thriller'],
    rating: 7.2,
    voteCount: 839,
    overview:
      'Street racing and heists collide when an undercover cop infiltrates a notorious crew. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future. A chemistry teacher diagnosed with cancer turns to manufacturing methamphetamine to secure his family’s future.',
  },
]

export function getMovieById(id: string): Movie | undefined {
  return movies.find((m) => m.id === id)
}

