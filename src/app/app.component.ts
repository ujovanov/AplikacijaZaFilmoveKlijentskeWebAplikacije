import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  activeUser: {
    active: boolean;
    userEmail: string;
  } | null = null;
  
  showBackToTop = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkActiveUser();
    
    window.addEventListener('storage', () => {
      this.checkActiveUser();
    });
    
    setInterval(() => {
      this.checkActiveUser();
    }, 1000);
  }
  
  checkActiveUser() {
    const activeUser = sessionStorage.getItem('activeUser');
    if (activeUser) {
      this.activeUser = JSON.parse(activeUser);
    } else {
      this.activeUser = null;
    }
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showBackToTop = (window.scrollY > 300);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  logout() {
    sessionStorage.removeItem('activeUser');
    this.activeUser = null;
    this.router.navigate(['/']);
  }
}
