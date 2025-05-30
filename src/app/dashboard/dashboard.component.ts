import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  rol: string | null = null;
  sidebarVisible = false;
  isMobileView = window.innerWidth <= 768;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.rol = localStorage.getItem('rol');
    this.updateViewMode();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateViewMode();
  }

  updateViewMode(): void {
    this.isMobileView = window.innerWidth <= 768;
    this.sidebarVisible = !this.isMobileView;
  }

  isAdmin(): boolean {
    return this.rol === 'admin';
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebarIfMobile(): void {
    if (this.isMobileView) {
      this.sidebarVisible = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
