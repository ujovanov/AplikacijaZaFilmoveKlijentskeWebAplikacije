import { Component, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  activeUser: {
    active: boolean;
    userEmail: string;
  } | null = null;
  
  showBackToTop = false;

  ngOnInit() {
    const activeUser = sessionStorage.getItem('activeUser');
    if (activeUser) {
      this.activeUser = JSON.parse(activeUser);
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
    window.location.reload();
  }
}
