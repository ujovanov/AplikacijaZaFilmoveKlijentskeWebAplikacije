import { Director } from "./director.model";
import { MovieActor } from "./movieActor.model";
import { MovieGenre } from "./movieGenre.model";
import { rating } from "./comment.model";

export interface Movie {
    movieId: number;
    internalId: string;
    corporateId: string;
    directorId: number;
    title: string;
    originalTitle: string;
    description: string;
    shortDescription: string;
    poster: string;
    startDate: string;
    shortUrl: string;
    runTime: number;
    createdAt: string;
    updatedAt: string | null;
    price: number;
    rating: rating[]|null;
    director: Director;
    movieActors: MovieActor[];
    movieGenres: MovieGenre[];
  }