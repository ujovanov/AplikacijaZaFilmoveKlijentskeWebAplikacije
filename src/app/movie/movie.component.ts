import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { Movie } from '../../models/movie.model';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Projection } from '../../models/projection.model';
import { Rating } from '../../models/rating.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-movie',
  imports: [NgIf, NgFor, FormsModule],
  templateUrl: './movie.component.html',
  styleUrl: './movie.component.css'
})
export class MovieComponent implements OnInit {
  movie?: Movie;
  loading = true;
  error = false;
  selectedProjection: Projection | null = null;
  newComment: string = '';
  newRating: number = 5;
  reservationSuccess: boolean = false;
  isActiveUser: boolean = JSON.parse(sessionStorage.getItem('activeUser') || '{"active": false}').active;
  canWriteReview: boolean = false;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    try {
      const shortUrl = this.route.snapshot.params['shortUrl'];
      
      const storedMovies = sessionStorage.getItem('movies');
      if (storedMovies) {
        const movies: Movie[] = JSON.parse(storedMovies);
        const foundMovie = movies.find(m => m.shortUrl === shortUrl);
        
        if (foundMovie) {
          if (foundMovie.rating) {
            foundMovie.rating = foundMovie.rating.map(r => ({
              ...r,
              createdAt: new Date(r.createdAt)
            }));
          }
          this.movie = foundMovie;
          this.loading = false;
          this.checkReviewPermission();
          this.handleFragmentNavigation();
          return;
        }
      }
      
      const response = await axios.get<Movie>(`https://movie.pequla.com/api/movie/short/${shortUrl}`);
      this.movie = response.data;
      
      this.checkReviewPermission();
      this.handleFragmentNavigation();
    } catch (error) {
      console.error('Error fetching movie:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }

  handleFragmentNavigation(): void {
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'reviews') {
        setTimeout(() => {
          const reviewsSection = document.getElementById('reviews-section');
          if (reviewsSection) {
            reviewsSection.scrollIntoView({ behavior: 'smooth' });
            
            if (this.canWriteReview) {
              const commentTextarea = document.getElementById('comment');
              if (commentTextarea) {
                commentTextarea.focus();
              }
            }
          }
        }, 500);
      }
    });
  }

  checkReviewPermission() {
    if (!this.movie) return;
    
    const reservations = JSON.parse(sessionStorage.getItem('reservations') || '[]');
    const activeUser = JSON.parse(sessionStorage.getItem('activeUser') || '{"active": false, "userEmail": ""}');
    
    
    if (!activeUser.active) {
      this.canWriteReview = false;
      return;
    }
    
    const hasWatchedReservation = reservations.some((r: Reservation) => 
      r.movieId === this.movie!.movieId && 
      r.reservationUser === activeUser.userEmail &&
      r.reservationStatus === "gledano"
    );
    
    this.canWriteReview = hasWatchedReservation;
  }

  selectProjection(projection: Projection) {
    this.selectedProjection = projection;
    this.submitReservation(projection);
  }

  submitReservation(selectedProjection: Projection) {
    if (!this.selectedProjection || !this.movie) return;
    
    console.log('selectedProjection',selectedProjection);
    
    const reservations = JSON.parse(sessionStorage.getItem('reservations') || '[]');
    reservations.push({
      reservationUser: JSON.parse(sessionStorage.getItem('activeUser')!).userEmail,
      movieId: this.movie.movieId,
      movieTitle: this.movie.title,
      projection: this.selectedProjection,
      date: selectedProjection.projectionDate+ " "+selectedProjection.projectionTime,
      reservationStatus:"rezervisano",
      price: this.movie.price
    });
    sessionStorage.setItem('reservations', JSON.stringify(reservations));
    this.reservationSuccess = true;
    
    this.checkReviewPermission();
  }

  submitComment() {
    if (!this.movie || !this.newComment) return;
    
    const newRatingObj: Rating = {
      rating: parseInt(this.newRating.toString()),
      comment: this.newComment,
      userName: JSON.parse(sessionStorage.getItem('activeUser')!).userEmail,
      createdAt: new Date()
    };
    
    if (!this.movie.rating) {
      this.movie.rating = [];
    }
    this.movie.rating.push(newRatingObj);
    
    const storedMovies = sessionStorage.getItem('movies');
    if (storedMovies) {
      const movies: Movie[] = JSON.parse(storedMovies);
      const movieIndex = movies.findIndex(m => m.movieId === this.movie?.movieId);
      if (movieIndex !== -1) {
        movies[movieIndex] = this.movie;
        sessionStorage.setItem('movies', JSON.stringify(movies));
      }
    }
    
    this.newComment = '';
    this.newRating = 5;
  }

  averageRating(): number {
    if (!this.movie?.rating || this.movie.rating.length === 0) return 0;
    const sum = this.movie.rating.reduce((s, rating) => s + rating.rating, 0);
    return parseFloat((sum / this.movie.rating.length).toFixed(2));
  }
}
