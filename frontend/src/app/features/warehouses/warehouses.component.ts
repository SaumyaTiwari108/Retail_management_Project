import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Warehouse } from '../../core/models/models';

@Component({
  selector: 'app-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Multi-Location Warehouse & Store Network</h4>
          <p class="text-muted mb-0 small">Manage regional distribution hubs, fulfillment centers and retail outlets</p>
        </div>
        <button *ngIf="isAdmin()" class="btn btn-sm rims-btn-primary d-flex align-items-center gap-2" (click)="openCreateModal()">
          <i class="bi bi-plus-lg"></i> Add New Location
        </button>
      </div>

      <!-- Warehouse Cards Grid -->
      <div class="row g-3">
        <div class="col-12 col-md-6 col-xl-4" *ngFor="let w of warehouses">
          <div class="rims-card p-4 h-100 position-relative">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <span class="badge" [ngClass]="w.type === 'WAREHOUSE' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'">
                <i class="bi me-1" [ngClass]="w.type === 'WAREHOUSE' ? 'bi-buildings' : 'bi-shop'"></i>
                {{ w.type }}
              </span>
              <span class="badge font-monospace" [ngClass]="w.active ? 'badge-soft-success' : 'badge-soft-secondary'">
                {{ w.code }}
              </span>
            </div>

            <h5 class="fw-bold text-dark mb-2">{{ w.name }}</h5>

            <div class="text-muted small mb-3">
              <div class="d-flex align-items-center gap-2 mb-1">
                <i class="bi bi-geo-alt"></i> {{ w.address || 'Address not listed' }}, {{ w.city || 'Regional' }}
              </div>
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-telephone"></i> {{ w.phone || 'Phone not registered' }}
              </div>
            </div>

            <div class="border-top pt-3 d-flex justify-content-between align-items-center">
              <span class="text-muted small">Status: <strong>{{ w.active ? 'Operational' : 'Closed' }}</strong></span>
              <button *ngIf="isAdmin()" class="btn btn-xs btn-outline-secondary" (click)="openEditModal(w)">
                <i class="bi bi-pencil"></i> Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal fade show d-block" *ngIf="showModal" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-dark">{{ isEditing ? 'Edit Location' : 'Register Location' }}</h5>
              <button type="button" class="btn-close" (click)="showModal = false"></button>
            </div>
            <form (ngSubmit)="saveWarehouse()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Location Code *</label>
                  <input type="text" class="form-control font-monospace" [(ngModel)]="currentWarehouse.code" name="code" required placeholder="e.g. WH-EAST-01" [disabled]="isEditing">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Location Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentWarehouse.name" name="name" required placeholder="e.g. Eastern Fulfillment Center">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Type *</label>
                  <select class="form-select" [(ngModel)]="currentWarehouse.type" name="type" required>
                    <option value="WAREHOUSE">Distribution Warehouse</option>
                    <option value="RETAIL_STORE">Retail Store / Point of Sale</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Address</label>
                  <input type="text" class="form-control" [(ngModel)]="currentWarehouse.address" name="addr" placeholder="Street address...">
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold small">City</label>
                    <input type="text" class="form-control" [(ngModel)]="currentWarehouse.city" name="city">
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold small">Phone</label>
                    <input type="text" class="form-control" [(ngModel)]="currentWarehouse.phone" name="phone">
                  </div>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="whActive" [(ngModel)]="currentWarehouse.active" name="active">
                  <label class="form-check-label small fw-medium" for="whActive">Active and operational</label>
                </div>
              </div>
              <div class="modal-footer border-top bg-light">
                <button type="button" class="btn btn-sm btn-secondary" (click)="showModal = false">Cancel</button>
                <button type="submit" class="btn btn-sm rims-btn-primary" [disabled]="submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WarehousesComponent implements OnInit {
  warehouses: Warehouse[] = [];
  showModal = false;
  isEditing = false;
  submitting = false;

  currentWarehouse: Warehouse = { code: '', name: '', type: 'WAREHOUSE', active: true };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.apiService.getWarehouses().subscribe({
      next: (res) => { if (res.success) this.warehouses = res.data; }
    });
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentWarehouse = { code: '', name: '', type: 'WAREHOUSE', active: true };
    this.showModal = true;
  }

  openEditModal(w: Warehouse): void {
    this.isEditing = true;
    this.currentWarehouse = { ...w };
    this.showModal = true;
  }

  saveWarehouse(): void {
    this.submitting = true;
    if (this.isEditing && this.currentWarehouse.id) {
      this.apiService.updateWarehouse(this.currentWarehouse.id, this.currentWarehouse).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.toastService.success('Warehouse updated successfully');
            this.showModal = false;
            this.loadWarehouses();
          }
        },
        error: () => this.submitting = false
      });
    } else {
      this.apiService.createWarehouse(this.currentWarehouse).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.toastService.success('Warehouse created successfully');
            this.showModal = false;
            this.loadWarehouses();
          }
        },
        error: () => this.submitting = false
      });
    }
  }
}
