import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import axios from 'axios';
import { Movie } from '../../models/movie.model';
import { NgIf, NgFor, DatePipe } from '@angular/common';

@Component({
  selector: 'app-movie',
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './movie.component.html',
  styleUrl: './movie.component.css'
})
export class MovieComponent implements OnInit {
  movie?: Movie;
  loading = true;
  error = false;

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    try {
      const shortUrl = this.route.snapshot.params['shortUrl'];
      const response = await axios.get<Movie>(`https://movie.pequla.com/api/movie/short/${shortUrl}`);
      this.movie = response.data;
    } catch (error) {
      console.error('Error fetching movie:', error);
      this.error = true;
    } finally {
      this.loading = false;
    }
  }
}
