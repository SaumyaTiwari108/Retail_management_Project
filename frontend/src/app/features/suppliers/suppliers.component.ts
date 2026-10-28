import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Supplier } from '../../core/models/models';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Supplier & Vendor Directory</h4>
          <p class="text-muted mb-0 small">Manage vendor relationships, procurement contacts, and supply chain partners</p>
        </div>
        <button *ngIf="canEdit()" class="btn btn-sm rims-btn-primary d-flex align-items-center gap-2" (click)="openCreateModal()">
          <i class="bi bi-plus-lg"></i> Register Supplier
        </button>
      </div>

      <!-- Suppliers Table -->
      <div class="rims-card overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Supplier Company</th>
                <th>Contact Representative</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Operating Address</th>
                <th>Status</th>
                <th class="text-end" *ngIf="canEdit()">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of suppliers">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="bg-secondary-subtle text-secondary p-2 rounded">
                      <i class="bi bi-truck"></i>
                    </div>
                    <span class="fw-bold text-dark">{{ s.name }}</span>
                  </div>
                </td>
                <td class="fw-medium">{{ s.contactPerson || 'N/A' }}</td>
                <td><a [href]="'mailto:' + s.email" class="text-decoration-none">{{ s.email || '&mdash;' }}</a></td>
                <td class="text-muted small">{{ s.phone || '&mdash;' }}</td>
                <td class="text-muted small" style="max-width: 200px;">{{ s.address || 'Regional Distribution' }}</td>
                <td>
                  <span class="badge" [ngClass]="s.status === 'ACTIVE' ? 'badge-soft-success' : 'badge-soft-secondary'">
                    {{ s.status }}
                  </span>
                </td>
                <td class="text-end" *ngIf="canEdit()">
                  <button class="btn btn-sm btn-outline-secondary" (click)="openEditModal(s)">
                    <i class="bi bi-pencil"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="suppliers.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">No suppliers registered in the system.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Supplier Modal -->
      <div class="modal fade show d-block" *ngIf="showModal" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-dark">{{ isEditing ? 'Edit Supplier' : 'Register Supplier' }}</h5>
              <button type="button" class="btn-close" (click)="showModal = false"></button>
            </div>
            <form (ngSubmit)="saveSupplier()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Supplier Company Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentSupplier.name" name="name" required placeholder="e.g. Apex Global Tech Logistics">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Contact Person</label>
                  <input type="text" class="form-control" [(ngModel)]="currentSupplier.contactPerson" name="contact" placeholder="e.g. Marcus Vance">
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold small">Email Address</label>
                    <input type="email" class="form-control" [(ngModel)]="currentSupplier.email" name="email" placeholder="orders@supplier.com">
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold small">Phone Number</label>
                    <input type="text" class="form-control" [(ngModel)]="currentSupplier.phone" name="phone" placeholder="+1-800-555-0199">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Address</label>
                  <input type="text" class="form-control" [(ngModel)]="currentSupplier.address" name="addr" placeholder="Warehouse address, City...">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Supplier Status</label>
                  <select class="form-select" [(ngModel)]="currentSupplier.status" name="status">
                    <option value="ACTIVE">Active Vendor</option>
                    <option value="INACTIVE">Inactive / Suspended</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer border-top bg-light">
                <button type="button" class="btn btn-sm btn-secondary" (click)="showModal = false">Cancel</button>
                <button type="submit" class="btn btn-sm rims-btn-primary" [disabled]="submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  showModal = false;
  isEditing = false;
  submitting = false;

  currentSupplier: Supplier = { name: '', status: 'ACTIVE' };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe({
      next: (res) => { if (res.success) this.suppliers = res.data; }
    });
  }

  canEdit(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_INVENTORY_MANAGER');
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentSupplier = { name: '', status: 'ACTIVE' };
    this.showModal = true;
  }

  openEditModal(s: Supplier): void {
    this.isEditing = true;
    this.currentSupplier = { ...s };
    this.showModal = true;
  }

  saveSupplier(): void {
    this.submitting = true;
    if (this.isEditing && this.currentSupplier.id) {
      this.apiService.updateSupplier(this.currentSupplier.id, this.currentSupplier).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.toastService.success('Supplier updated successfully');
            this.showModal = false;
            this.loadSuppliers();
          }
        },
        error: () => this.submitting = false
      });
    } else {
      this.apiService.createSupplier(this.currentSupplier).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.toastService.success('Supplier registered successfully');
            this.showModal = false;
            this.loadSuppliers();
          }
        },
        error: () => this.submitting = false
      });
    }
  }
}
