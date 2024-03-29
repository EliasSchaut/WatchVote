import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import { MovieSearchType } from "@/types/movie.types/movie_search.type";

@Injectable()
export class ImdbApiService {
  constructor() {
  }

  api_key = process.env.IMDB_API_KEY;

  async get(imdb_id: string, lang: string = "en"): Promise<Prisma.MovieInfoCreateInput | null> {
    const response = await fetch(`https://imdb-api.com/${lang}/API/Title/${this.api_key}/${imdb_id}/Ratings`).catch(() => {
      throw new ServiceUnavailableException();
    });
    const movie = await response.json() as any;

    if (movie.type !== "Movie") return null;

    return {
      imdb_id: movie.id,
      language: lang,
      title: movie.title,
      year: Number(movie.year),
      genre: movie.genres,
      director: movie.directors,
      actors: movie.stars,
      imdb_rate: movie.ratings.imDb,
      meta_score: movie.ratings.metacritic,
      rotten_score: movie.ratings.rottenTomatoes,
      languages: movie.languages,
      plot: (movie.plotLocal !== "") ? movie.plotLocal : movie.plot,
      runtime: Number(movie.runtimeMins),
      link: `https://www.imdb.com/title/${movie.id}/`,
      poster: movie.image
    } as Prisma.MovieInfoCreateInput;
  }

  async get_all_langs(imdb_id: string): Promise<Prisma.MovieInfoCreateInput[] | null> {
    const langs = ["en", "de"];
    const movie_infos: Prisma.MovieInfoCreateInput[] = [];

    for (const lang of langs) {
      const movie_info = await this.get(imdb_id, lang);
      if (movie_info !== null) movie_infos.push(movie_info);
      else return null
    }
    return movie_infos;
  }

  async search(search_input: string, lang: string = "en"): Promise<MovieSearchType[]> {
    const response = await fetch(`https://imdb-api.com/${lang}/API/SearchMovie/${this.api_key}/${search_input}`)
      .catch(() => {
        throw new ServiceUnavailableException();
      });
    const data = await response.json() as any;
    let movies = data.results as any[];
    if (movies.length > 5) {
      movies = movies.slice(0, 5);
    }

    return movies.map((movie) => {
      return {
        imdb_id: movie.id,
        title: movie.title,
        description: movie.description,
        poster: movie.image
      }
    }) as MovieSearchType[];
  }
}
