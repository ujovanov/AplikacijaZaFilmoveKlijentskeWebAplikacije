import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { user } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  errorMessage: string = '';
  user: {
    email: string;
    password: string;
  } = {
    email: '',
    password: ''
  }

  constructor(private router: Router) {}

  onSubmit(): void {
    if (!this.user.email || !this.user.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    const foundUser = users.find((user: user) => 
      user.email === this.user.email && user.password === this.user.password
    );

    if (foundUser) {
      const activeUser = {
        active: true,
        userEmail: foundUser.email
      };
      
      sessionStorage.setItem('activeUser', JSON.stringify(activeUser));
      
      this.router.navigate(['/profile']).then(() => {
        window.location.reload();
      });
    } else {
      this.errorMessage = 'Invalid email or password';
    }
  }
}
