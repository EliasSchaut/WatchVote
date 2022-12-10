import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MovieService } from "./movie.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { User } from "../../common/decorators/user.decorator";
import { JwtUser } from "../../types/jwtuser.type";
import { MovieExtType } from "../../types/movie.types/movie_ext.type";
import { WatchlistExtType } from "../../types/movie.types/watchlist_ext.type";
import { History, Vote, Movie } from "@prisma/client";
import imdb from "imdb-api";
import { ResDto } from "../../types/res.dto";

/**
 * Controller for movie related routes
 */
@Controller('movie')
export class MovieController {

  constructor(private readonly movieService: MovieService) {}

  /**
   * PUBLIC GET all movies with its related data
   */
  @Get('all')
  async get_all_media() : Promise<MovieExtType[]> {
    return await this.movieService.get_all()
  }

  /**
   * PUBLIC GET all movies from watchlist with its related data
   */
  @Get('watchlist')
  async get_watchlist() : Promise<WatchlistExtType[]> {
    return await this.movieService.get_watchlist()
  }

  /**
   * PUBLIC GET all movies from history with its related data
   */
  @Get('history')
  async get_history() : Promise<History[]> {
    return await this.movieService.get_history()
  }

  /**
   * PRIVATE GET information about a specific movie given by its imdb_id
   * @param imdb_id
   */
  @UseGuards(JwtAuthGuard)
  @Get(':imdb_id')
  async get_media(@Param('imdb_id') imdb_id: string) : Promise<imdb.Movie> {
    return await this.movieService.get(imdb_id)
  }

  /**
   * PRIVATE POST add a movie to the movie database by a given imdb_id.
   * This is only possible if the movie is not already in the movie, watchlist or history database!
   * The given user will be the proposer of the movie.
   * @param user
   * @param imdb_id
   */
  @UseGuards(JwtAuthGuard)
  @Post(':imdb_id')
  async post_media(@User() user: JwtUser, @Param('imdb_id') imdb_id: string): Promise<{movie: Movie, vote: Vote}> {
    return await this.movieService.save(imdb_id, user.id)
  }

  /**
   * PRIVATE DELETE remove a movie from the movie database by a given imdb_id, when the given user is the proposer
   * @param user
   * @param imdb_id
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':imdb_id')
  async delete_media(@User() user: JwtUser, @Param('imdb_id') imdb_id: string) : Promise<ResDto> {
    return await this.movieService.delete(imdb_id, user.id)
  }
}