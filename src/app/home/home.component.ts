import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Movie } from '../../models/movie.model';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SearchCriteria } from '../../models/searchCriteria.model';
import { rating } from '../../models/comment.model';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  loading: boolean = true;
  allGenres: string[] = [];
  
  searchCriteria: SearchCriteria = {
    title: '',
    description: '',
    genre: '',
    minDuration: null,
    maxDuration: null,
    director: '',
    actor: '',
    releaseDate: null,
    minPrice: null,
    maxPrice: null,
    minRating: null
  };

  async ngOnInit() {
    const storedMovies = sessionStorage.getItem('movies');
    
    if (storedMovies) {
      this.movies = JSON.parse(storedMovies);
      this.filteredMovies = [...this.movies];
      this.extractGenres();
      this.loading = false;
    } else {
      try {
        console.log('Fetching movies from API');
        const response = await axios.get<Movie[]>('https://movie.pequla.com/api/movie');
        this.movies = response.data.map(movie => ({
          ...movie,
          price: Math.floor(Math.random() * (700 - 300 + 1)) + 300,
          rating: Math.random() > 0.2 ? Array(Math.floor(Math.random() * 5 + 1))
            .fill(0)
            .map(() => ({
              rating: Math.floor(Math.random() * 5) + 1,
              comment: null,
              userName: 'anonymous',
              createdAt: new Date().toLocaleDateString('en-GB')
            }))
            : null
        }));
        
        sessionStorage.setItem('movies', JSON.stringify(this.movies));
        
        this.filteredMovies = [...this.movies];
        this.extractGenres();
        console.log('Fetched movies:', this.movies);
        this.loading = false;
      } catch (error) {
        console.error('Error fetching movies:', error);
        this.loading = false;
      }
    }
  }

  extractGenres() {
    const genreSet = new Set<string>();
    this.movies.forEach(movie => {
      movie.movieGenres.forEach(mg => {
        genreSet.add(mg.genre.name);
      });
    });
    this.allGenres = Array.from(genreSet).sort();
  }

  applyFilters() {
    this.filteredMovies = this.movies.filter(movie => {
      if (this.searchCriteria.title && 
          !movie.title.toLowerCase().includes(this.searchCriteria.title.toLowerCase())) {
        return false;
      }
      
      if (this.searchCriteria.description && 
          !(movie.shortDescription.toLowerCase().includes(this.searchCriteria.description.toLowerCase()) || 
            movie.description.toLowerCase().includes(this.searchCriteria.description.toLowerCase()))) {
        return false;
      }
      
      if (this.searchCriteria.genre && 
          !movie.movieGenres.some(mg => mg.genre.name === this.searchCriteria.genre)) {
        return false;
      }
      
      if (this.searchCriteria.minDuration !== null && movie.runTime < this.searchCriteria.minDuration) {
        return false;
      }
      if (this.searchCriteria.maxDuration !== null && movie.runTime > this.searchCriteria.maxDuration) {
        return false;
      }
      
      if (this.searchCriteria.director && 
          !movie.director.name.toLowerCase().includes(this.searchCriteria.director.toLowerCase())) {
        return false;
      }
      
      if (this.searchCriteria.actor && 
          !movie.movieActors.some(ma => 
            ma.actor.name.toLowerCase().includes(this.searchCriteria.actor.toLowerCase())
          )) {
        return false;
      }
      
      if (this.searchCriteria.releaseDate) {
        const searchDate = new Date(this.searchCriteria.releaseDate);
        const releaseDate = new Date(movie.startDate);
        if (releaseDate.getTime() < searchDate.getTime()) {
          return false;
        }
      }

      if (this.searchCriteria.minPrice !== null && movie.price < this.searchCriteria.minPrice) {
        return false;
      }
      
      if (this.searchCriteria.maxPrice !== null && movie.price > this.searchCriteria.maxPrice) {
        return false;
      }

      if (this.searchCriteria.minRating !== null && movie.rating && movie.rating.length > 0 && (this.averageRating(movie.rating) < this.searchCriteria.minRating || this.averageRating(movie.rating) === 0)) {
        return false;
      }
      
      return true;
    });
  }

  averageRating(ratings: rating[]): number {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((s, rating) => s + rating.rating, 0);
    return parseFloat((sum / ratings.length).toFixed(2));
  }

  resetFilters() {
    this.searchCriteria = {
      title: '',
      description: '',
      genre: '',
      minDuration: null,
      maxDuration: null,
      director: '',
      actor: '',
      releaseDate: null,
      minPrice: null,
      maxPrice: null,
      minRating: null
    };
    this.filteredMovies = [...this.movies];
  }
}
