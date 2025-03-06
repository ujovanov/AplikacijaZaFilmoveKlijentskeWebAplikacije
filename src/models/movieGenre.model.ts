import { Genre } from "./genre.model";

export interface MovieGenre {
    movieGenreId: number;
    movieId: number;
    genreId: number;
    genre: Genre;
  }