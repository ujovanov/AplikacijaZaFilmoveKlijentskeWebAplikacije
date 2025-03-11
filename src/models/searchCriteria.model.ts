export interface SearchCriteria {
    title: string;
    description: string;
    genre: string;
    minDuration: number | null;
    maxDuration: number | null;
    director: string;
    actor: string;
    releaseDate: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    minRating: number| null;
  }