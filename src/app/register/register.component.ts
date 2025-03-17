import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { user } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  newUser: user = {
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
  confirmPassword: string = '';
  selectedGenres: string[] = [];
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private router: Router) {}

  onGenreChange(event: Event, genre: string): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (checkbox.checked) {
      this.selectedGenres.push(genre);
    } else {
      const index = this.selectedGenres.indexOf(genre);
      if (index !== -1) {
        this.selectedGenres.splice(index, 1);
      }
    }
  }

  onSubmit(): void {
    if (this.newUser.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (!this.newUser.email || !this.newUser.password || !this.newUser.firstName || !this.newUser.lastName || !this.newUser.phoneNumber || !this.newUser.address) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.newUser.favoriteMovieGenres = this.selectedGenres;
    
    this.newUser.createdAt = new Date();
    this.newUser.updatedAt = new Date();

    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    const userExists = existingUsers.some((user: user) => user.email === this.newUser.email);
    
    if (userExists) {
      this.errorMessage = 'A user with this email already exists';
      return;
    }

    existingUsers.push(this.newUser);
    
    localStorage.setItem('users', JSON.stringify(existingUsers));
    
    this.successMessage = 'Registration successful! Please log in.';
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }
}
