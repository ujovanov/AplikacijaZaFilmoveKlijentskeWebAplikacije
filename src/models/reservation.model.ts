import { Projection } from './projection.model';

export interface Reservation {
    reservationUser: string;
    movieId: number;
    movieTitle: string;
    projection: Projection;
    date: string;
    reservationStatus: string;
    price: number;
}
