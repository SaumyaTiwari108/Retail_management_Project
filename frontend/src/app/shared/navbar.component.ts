import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="navbar navbar-expand-lg border-bottom px-4 py-2 sticky-top" style="background: #ffffff; height: 64px; z-index: 1020;">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm btn-light d-lg-none" type="button" (click)="toggleSidebar()">
          <i class="bi bi-list fs-5"></i>
        </button>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-primary-subtle text-primary fw-semibold px-2 py-1 rounded">XYZ RETAIL</span>
          <span class="text-muted d-none d-sm-inline fw-medium" style="font-size: 0.85rem;">PRG_RIMS_001</span>
        </div>
      </div>

      <!-- Global Search -->
      <div class="ms-4 me-auto d-none d-md-flex position-relative" style="width: 380px;">
        <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
        <input type="text"
               class="form-control ps-5 bg-light border-0"
               style="font-size: 0.875rem; border-radius: 20px;"
               placeholder="Search SKU, product name, or barcode..."
               [(ngModel)]="searchQuery"
               (keyup.enter)="onSearch()">
      </div>

      <!-- Right Action Items -->
      <div class="d-flex align-items-center gap-3">
        <!-- System Status Indicator -->
        <div class="d-none d-xl-flex align-items-center gap-2 px-2 py-1 rounded bg-success-subtle text-success" style="font-size: 0.75rem; font-weight: 600;">
          <span class="spinner-grow spinner-grow-sm text-success" style="width: 8px; height: 8px;"></span>
          LIVE DATABASE
        </div>

        <!-- Quick barcode scan shortcut -->
        <a routerLink="/barcode" class="btn btn-sm btn-outline-secondary d-none d-sm-flex align-items-center gap-1 rounded-pill px-3" style="font-size: 0.825rem;">
          <i class="bi bi-upc-scan text-primary"></i> Scan SKU
        </a>

        <!-- User profile dropdown / info -->
        <div class="d-flex align-items-center gap-2 ps-3 border-start">
          <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px; font-size: 0.85rem;">
            {{ (currentUser?.fullName?.charAt(0) || 'U') }}
          </div>
          <div class="d-none d-md-block text-start" style="line-height: 1.2;">
            <div class="fw-semibold text-dark" style="font-size: 0.875rem;">{{ currentUser?.fullName || 'User' }}</div>
            <span class="badge" [ngClass]="{
              'bg-danger-subtle text-danger': currentUser?.role === 'ROLE_ADMIN',
              'bg-primary-subtle text-primary': currentUser?.role === 'ROLE_INVENTORY_MANAGER',
              'bg-secondary-subtle text-secondary': currentUser?.role === 'ROLE_STAFF'
            }" style="font-size: 0.7rem; font-weight: 600;">
              {{ formatRole(currentUser?.role) }}
            </span>
          </div>

          <button class="btn btn-sm btn-outline-danger ms-2 rounded-circle" style="width: 32px; height: 32px; padding: 0;" title="Logout" (click)="logout()">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  searchQuery = '';

  constructor(public authService: AuthService, private router: Router) {}

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  formatRole(role?: string): string {
    if (role === 'ROLE_ADMIN') return 'ADMIN';
    if (role === 'ROLE_INVENTORY_MANAGER') return 'INV MANAGER';
    if (role === 'ROLE_STAFF') return 'STAFF';
    return 'USER';
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/products'], { queryParams: { q: this.searchQuery.trim() } });
    }
  }

  toggleSidebar(): void {
    document.body.classList.toggle('sidebar-collapsed');
  }

  logout(): void {
    this.authService.logout();
  }
}
