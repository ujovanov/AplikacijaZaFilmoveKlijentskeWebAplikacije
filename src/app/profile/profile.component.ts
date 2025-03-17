import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { user } from '../../models/user.model';
import { Reservation } from '../../models/reservation.model';
import { Projection } from '../../models/projection.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  constructor(private router: Router) {
  }

  activeUser: {
    active: boolean;
    userEmail: string;
  }={
    active: true,
    userEmail: ''
  };

  userData: user = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    favoriteMovieGenres: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  userReservations: Reservation[] = [];
  selectedMovieForReview: Reservation | null = null;
  
  editingReservation: { [key: number]: boolean } = {};
  availableProjectionsMap: { [key: number]: Projection[] } = {};
  selectedNewProjections: { [key: number]: Projection | null } = {};

  newPassword: string = '';
  confirmNewPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  selectedGenres: string[] = [];

  ngOnInit() {
    const activeUser = sessionStorage.getItem('activeUser');
    try{
      if (activeUser) {
        this.activeUser = JSON.parse(activeUser);
        this.loadUserData();
        this.loadUserReservations();
      }
    else{
      this.router.navigate(['/login']);
    }
    }
    catch(error){
      console.error('Error parsing active user:', error);
      this.router.navigate(['/login']);
    }
  }

  loadUserData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const currentUser = users.find((user: user) => user.email === this.activeUser.userEmail);
    
    if (currentUser) {
      this.userData = currentUser;
      this.selectedGenres = [...this.userData.favoriteMovieGenres];
    } else {
      this.errorMessage = 'User data not found';
    }
  }

  loadUserReservations() {
    try {
      const reservationsJson = sessionStorage.getItem('reservations');
      if (reservationsJson) {
        const allReservations: Reservation[] = JSON.parse(reservationsJson);
        this.userReservations = allReservations.filter(
          reservation => reservation.reservationUser === this.activeUser.userEmail
        );
      }
    } catch (error) {
      console.error('Error loading reservations:', error);
      this.errorMessage = 'Failed to load reservations';
    }
  }

  onGenreChange(event: Event, genre: string): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      if (!this.selectedGenres.includes(genre)) {
        this.selectedGenres.push(genre);
      }
    } else {
      const index = this.selectedGenres.indexOf(genre);
      if (index !== -1) {
        this.selectedGenres.splice(index, 1);
      }
    }
  }

  isGenreSelected(genre: string): boolean {
    return this.selectedGenres.includes(genre);
  }

  onSubmit(): void {
    if (this.newPassword) {
      if (this.newPassword !== this.confirmNewPassword) {
        this.errorMessage = 'New passwords do not match';
        this.successMessage = '';
        return;
      }
      this.userData.password = this.newPassword;
    }

    this.userData.favoriteMovieGenres = this.selectedGenres;
    
    this.userData.updatedAt = new Date();

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const userIndex = users.findIndex((u: user) => u.email === this.activeUser.userEmail);
    
    if (userIndex !== -1) {
      users[userIndex] = this.userData;
      
      localStorage.setItem('users', JSON.stringify(users));
      
      this.successMessage = 'Profile updated successfully';
      this.errorMessage = '';
      
      this.newPassword = '';
      this.confirmNewPassword = '';
    } else {
      this.errorMessage = 'Failed to update profile';
      this.successMessage = '';
    }
  }

  getReservationsByStatus(status: string): Reservation[] {
    return this.userReservations.filter(reservation => reservation.reservationStatus === status);
  }

  calculateTotalPrice(status: string): number {
    return this.getReservationsByStatus(status)
      .reduce((total, reservation) => total + reservation.price, 0);
  }

  updateReservationStatus(reservation: Reservation, newStatus: string): void {
    try {
      const reservationsJson = sessionStorage.getItem('reservations');
      if (reservationsJson) {
        const allReservations: Reservation[] = JSON.parse(reservationsJson);
        
        const reservationIndex = allReservations.findIndex(r => 
          r.reservationUser === reservation.reservationUser && 
          r.movieId === reservation.movieId && 
          r.projection.projectionId === reservation.projection.projectionId
        );
        
        if (reservationIndex !== -1) {
          allReservations[reservationIndex].reservationStatus = newStatus;
          
          sessionStorage.setItem('reservations', JSON.stringify(allReservations));
        
          this.loadUserReservations();
          
          this.successMessage = `Reservation status updated to ${newStatus}`;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Reservation not found';
          this.successMessage = '';
        }
      }
    } catch (error) {
      console.error('Error updating reservation status:', error);
      this.errorMessage = 'Failed to update reservation status';
      this.successMessage = '';
    }
  }

  reviewMovie(reservation: Reservation): void {
    try {
      const moviesJson = sessionStorage.getItem('movies');
      if (moviesJson) {
        const movies = JSON.parse(moviesJson);
        const movie = movies.find((m: any) => m.movieId === reservation.movieId);
        
        if (movie && movie.shortUrl) {
          this.router.navigate(['/movie', movie.shortUrl], { fragment: 'reviews' });
        } else {
          this.errorMessage = 'Movie information not found';
        }
      } else {
        this.errorMessage = 'Movie data not available';
      }
    } catch (error) {
      console.error('Error navigating to movie review:', error);
      this.errorMessage = 'Failed to open review page';
    }
  }

  toggleEditProjection(reservation: Reservation): void {
    const reservationId = reservation.projection.projectionId;
    
    if (this.editingReservation[reservationId]) {
      this.editingReservation[reservationId] = false;
      this.selectedNewProjections[reservationId] = null;
    } else {
      this.editingReservation[reservationId] = true;
      this.loadAvailableProjectionsForReservation(reservation);
    }
  }

  loadAvailableProjectionsForReservation(reservation: Reservation): void {
    try {
      const moviesJson = sessionStorage.getItem('movies');
      if (moviesJson) {
        const movies = JSON.parse(moviesJson);
        const movie = movies.find((m: any) => m.movieId === reservation.movieId);
        
        if (movie && movie.projections) {
          this.availableProjectionsMap[reservation.projection.projectionId] = movie.projections.filter(
            (p: Projection) => p.projectionId !== reservation.projection.projectionId
          );
        } else {
          this.errorMessage = 'Movie projections not found';
        }
      } else {
        this.errorMessage = 'Movie data not available';
      }
    } catch (error) {
      console.error('Error loading projections:', error);
      this.errorMessage = 'Failed to load available projections';
    }
  }

  changeProjectionForReservation(reservation: Reservation): void {
    const reservationId = reservation.projection.projectionId;
    const newProjection = this.selectedNewProjections[reservationId];
    
    if (!newProjection) {
      this.errorMessage = 'Please select a new projection time';
      return;
    }

    try {
      const reservationsJson = sessionStorage.getItem('reservations');
      if (reservationsJson) {
        const allReservations: Reservation[] = JSON.parse(reservationsJson);
        
        const reservationIndex = allReservations.findIndex(r => 
          r.reservationUser === reservation.reservationUser && 
          r.movieId === reservation.movieId && 
          r.projection.projectionId === reservation.projection.projectionId
        );
        
        if (reservationIndex !== -1) {
          allReservations[reservationIndex].projection = newProjection;
          allReservations[reservationIndex].date = 
            `${newProjection.projectionDate} ${newProjection.projectionTime}`;
          
          sessionStorage.setItem('reservations', JSON.stringify(allReservations));
        
          this.loadUserReservations();
          
          this.successMessage = 'Projection time updated successfully';
          this.errorMessage = '';
          
          this.editingReservation[reservationId] = false;
          this.selectedNewProjections[reservationId] = null;
        } else {
          this.errorMessage = 'Reservation not found';
          this.successMessage = '';
        }
      }
    } catch (error) {
      console.error('Error updating projection:', error);
      this.errorMessage = 'Failed to update projection time';
      this.successMessage = '';
    }
  }
}
