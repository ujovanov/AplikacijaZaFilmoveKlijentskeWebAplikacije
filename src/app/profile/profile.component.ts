import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { user } from '../../models/user.model';

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

  newPassword: string = '';
  confirmNewPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  selectedGenres: string[] = [];

  ngOnInit() {
    const activeUser = sessionStorage.getItem('activeUser');
    if (activeUser) {
      this.activeUser = JSON.parse(activeUser);
      this.loadUserData();
    }
    else{
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
}
