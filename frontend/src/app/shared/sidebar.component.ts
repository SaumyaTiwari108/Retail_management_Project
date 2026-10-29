import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar bg-white border-end d-flex flex-column" style="width: 250px; min-height: calc(100vh - 64px);">
      <!-- Brand & Version header -->
      <div class="px-4 py-3 border-bottom d-flex align-items-center gap-2">
        <div class="bg-primary text-white rounded p-1 d-flex align-items-center justify-content-center" style="width: 28px; height: 28px;">
          <i class="bi bi-box-seam fs-6"></i>
        </div>
        <div>
          <div class="fw-bold text-dark" style="font-size: 0.95rem; letter-spacing: -0.02em;">RIMS Portal</div>
          <div class="text-muted" style="font-size: 0.72rem;">XYZ Retail v1.0</div>
        </div>
      </div>

      <!-- Navigation groups -->
      <div class="flex-grow-1 overflow-auto py-3 px-3">
        <!-- Main Section -->
        <div class="text-uppercase text-muted fw-bold px-3 mb-2" style="font-size: 0.68rem; letter-spacing: 0.08em;">
          Overview
        </div>
        <ul class="nav flex-column mb-3">
          <li class="nav-item">
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-grid-1x2-fill"></i>
              <span>Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/smart-reorder" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-cpu-fill text-warning"></i>
              <span>Smart Reorder</span>
              <span class="badge bg-warning text-dark ms-auto" style="font-size: 0.65rem;">AI Logic</span>
            </a>
          </li>
        </ul>

        <!-- Catalog & Inventory Section -->
        <div class="text-uppercase text-muted fw-bold px-3 mb-2" style="font-size: 0.68rem; letter-spacing: 0.08em;">
          Inventory Ops
        </div>
        <ul class="nav flex-column mb-3">
          <li class="nav-item">
            <a routerLink="/products" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-boxes"></i>
              <span>Products & Catalog</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/categories" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-tags-fill"></i>
              <span>Categories</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/inventory" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-arrow-left-right"></i>
              <span>Stock Movements</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/warehouses" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-buildings-fill"></i>
              <span>Warehouses / Stores</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/barcode" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-upc-scan"></i>
              <span>Barcode & RFID</span>
            </a>
          </li>
        </ul>

        <!-- Procurement & Orders Section -->
        <div class="text-uppercase text-muted fw-bold px-3 mb-2" style="font-size: 0.68rem; letter-spacing: 0.08em;">
          Procurement & Sales
        </div>
        <ul class="nav flex-column mb-3">
          <li class="nav-item">
            <a routerLink="/purchase-orders" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-cart-check-fill"></i>
              <span>Purchase Orders</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/suppliers" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-truck"></i>
              <span>Suppliers</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/orders" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-receipt-cutoff"></i>
              <span>Customer Sales</span>
            </a>
          </li>
          <li class="nav-item">
            <a routerLink="/customers" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-people-fill"></i>
              <span>Customers</span>
            </a>
          </li>
        </ul>

        <!-- Reports & Administration -->
        <div class="text-uppercase text-muted fw-bold px-3 mb-2" style="font-size: 0.68rem; letter-spacing: 0.08em;">
          Enterprise Insights
        </div>
        <ul class="nav flex-column">
          <li class="nav-item">
            <a routerLink="/reports" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-file-earmark-bar-graph-fill"></i>
              <span>Reports & CSV</span>
            </a>
          </li>
          <li class="nav-item" *ngIf="isAdmin()">
            <a routerLink="/users" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-person-gear"></i>
              <span>User Accounts</span>
            </a>
          </li>
          <li class="nav-item" *ngIf="isAdmin()">
            <a routerLink="/audit" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-shield-check"></i>
              <span>Audit Trail</span>
            </a>
          </li>
          <li class="nav-item" *ngIf="isAdmin()">
            <a routerLink="/settings" routerLinkActive="active" class="nav-link rims-nav-link d-flex align-items-center gap-3 px-3 py-2 rounded">
              <i class="bi bi-gear-fill"></i>
              <span>System Settings</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Footer Info -->
      <div class="p-3 border-top text-muted" style="font-size: 0.75rem;">
        <div class="d-flex align-items-center justify-content-between">
          <span>Client: XYZ Retail Corp</span>
          <span class="badge bg-light text-dark border">Agile V1</span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .rims-nav-link {
      color: #475569;
      font-weight: 500;
      font-size: 0.885rem;
      transition: all 0.15s ease-in-out;
      margin-bottom: 2px;
    }
    .rims-nav-link:hover {
      background-color: #f1f5f9;
      color: #0f172a;
    }
    .rims-nav-link.active {
      background-color: #eff6ff;
      color: #2563eb;
      font-weight: 600;
    }
    .rims-nav-link.active i {
      color: #2563eb;
    }
  `]
})
export class SidebarComponent {
  constructor(private authService: AuthService) {}

  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }
}
