import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { Movie } from '../../models/movie.model';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [NgFor, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  movies: Movie[] = [];

  async ngOnInit() {
    try {
      const response = await axios.get<Movie[]>('https://movie.pequla.com/api/movie');
      this.movies = response.data;
      console.log('Fetched movies:', this.movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  }
}
