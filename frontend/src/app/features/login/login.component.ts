import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="d-flex align-items-center justify-content-center min-vh-100" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
      <div class="card border-0 shadow-lg p-4 p-md-5" style="max-width: 440px; width: 100%; border-radius: 16px; background: #ffffff;">
        <!-- Header -->
        <div class="text-center mb-4">
          <div class="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-3">
            <i class="bi bi-box-seam fs-2"></i>
          </div>
          <h3 class="fw-bold text-dark mb-1">RIMS Portal</h3>
          <p class="text-muted small">Retail Inventory Management System &bull; PRG_RIMS_001</p>
          <span class="badge bg-secondary-subtle text-secondary px-2 py-1">XYZ Retail Corporation</span>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="mb-3">
            <label class="form-label fw-semibold text-dark" style="font-size: 0.85rem;">Username</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-person text-muted"></i></span>
              <input type="text"
                     class="form-control border-start-0"
                     name="username"
                     [(ngModel)]="username"
                     required
                     placeholder="Enter your username">
            </div>
          </div>

          <div class="mb-4">
            <div class="d-flex justify-content-between">
              <label class="form-label fw-semibold text-dark" style="font-size: 0.85rem;">Password</label>
            </div>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock text-muted"></i></span>
              <input type="password"
                     class="form-control border-start-0"
                     name="password"
                     [(ngModel)]="password"
                     required
                     placeholder="Enter your password">
            </div>
          </div>

          <button type="submit"
                  class="btn rims-btn-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  [disabled]="loading || !username || !password">
            <span *ngIf="loading" class="spinner-border spinner-border-sm"></span>
            <span>{{ loading ? 'Signing in...' : 'Sign In to Dashboard' }}</span>
          </button>
        </form>

        <!-- Quick Demo Account Switcher -->
        <div class="mt-4 pt-3 border-top text-center">
          <div class="text-muted fw-semibold mb-2" style="font-size: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase;">
            Quick Demo Login Profiles
          </div>
          <div class="d-flex gap-2 justify-content-center flex-wrap">
            <button type="button" class="btn btn-sm btn-outline-primary" (click)="fillCredentials('admin', 'Admin@123')">
              <i class="bi bi-shield-lock-fill me-1"></i> Admin
            </button>
            <button type="button" class="btn btn-sm btn-outline-success" (click)="fillCredentials('manager', 'Manager@123')">
              <i class="bi bi-boxes me-1"></i> Manager
            </button>
            <button type="button" class="btn btn-sm btn-outline-secondary" (click)="fillCredentials('staff', 'Staff@123')">
              <i class="bi bi-person-badge me-1"></i> Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = 'admin';
  password = 'Admin@123';
  loading = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  fillCredentials(u: string, p: string): void {
    this.username = u;
    this.password = p;
  }

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.loading = true;

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.toastService.success(`Welcome back, ${res.data.fullName}!`);
          this.router.navigate(['/dashboard']);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
