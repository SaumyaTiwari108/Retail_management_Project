import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Customer } from '../../core/models/models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-3">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="fw-bold mb-1 text-navy">Customer Directory</h4>
          <p class="text-muted mb-0 small">Manage retail and enterprise client records, contact details, and account histories</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2" (click)="openCustomerModal()">
          <i class="bi bi-person-plus-fill"></i>
          <span>Add New Customer</span>
        </button>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body py-3">
          <div class="row g-3 align-items-center">
            <div class="col-md-6 col-lg-4">
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
                <input 
                  type="text" 
                  class="form-control border-start-0 ps-0" 
                  placeholder="Search customer by name, email or phone..." 
                  [(ngModel)]="searchQuery" 
                  (ngModelChange)="onSearch()">
              </div>
            </div>
            <div class="col-md-6 col-lg-8 text-md-end text-muted small">
              Showing <strong>{{ filteredCustomers.length }}</strong> of {{ customers.length }} registered clients
            </div>
          </div>
        </div>
      </div>

      <!-- Customers Table Card -->
      <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-secondary text-uppercase fs-7 border-bottom">
                <tr>
                  <th class="ps-4 py-3">ID</th>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Billing / Shipping Address</th>
                  <th>Registered On</th>
                  <th class="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="loading">
                  <td colspan="7" class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Loading customer directory...
                  </td>
                </tr>

                <tr *ngIf="!loading && filteredCustomers.length === 0">
                  <td colspan="7" class="text-center py-5 text-muted">
                    <i class="bi bi-people display-6 d-block mb-2 text-secondary opacity-50"></i>
                    No customer accounts found matching your query.
                  </td>
                </tr>

                <tr *ngFor="let c of filteredCustomers">
                  <td class="ps-4 fw-bold text-secondary">#{{ c.id }}</td>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="avatar-circle bg-primary-subtle text-primary fw-bold">
                        {{ c.name.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="fw-semibold text-dark">{{ c.name }}</div>
                        <span class="badge bg-light text-secondary border">Verified Account</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span *ngIf="c.email"><i class="bi bi-envelope me-1 text-muted"></i>{{ c.email }}</span>
                    <span *ngIf="!c.email" class="text-muted fst-italic">—</span>
                  </td>
                  <td>
                    <span *ngIf="c.phone"><i class="bi bi-telephone me-1 text-muted"></i>{{ c.phone }}</span>
                    <span *ngIf="!c.phone" class="text-muted fst-italic">—</span>
                  </td>
                  <td>
                    <span class="text-truncate d-inline-block" style="max-width: 250px;" [title]="c.address || ''">
                      {{ c.address || '—' }}
                    </span>
                  </td>
                  <td class="small text-muted">{{ c.createdAt ? (c.createdAt | date:'mediumDate') : '—' }}</td>
                  <td class="text-end pe-4">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary" (click)="openCustomerModal(c)" title="Edit Profile">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-outline-danger" (click)="confirmDelete(c)" title="Delete Profile">
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add/Edit Customer Modal -->
      <div class="modal fade show d-block" *ngIf="showModal" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-navy text-white">
              <h5 class="modal-title fs-6 fw-bold">
                <i class="bi bi-person me-2"></i>
                {{ editingCustomer?.id ? 'Edit Customer Profile' : 'Register New Customer' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <form (ngSubmit)="saveCustomer()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Full Legal Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" required placeholder="e.g. Eleanor Vance">
                </div>
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Email Address</label>
                    <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" placeholder="client@example.com">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Contact Phone</label>
                    <input type="text" class="form-control" [(ngModel)]="formData.phone" name="phone" placeholder="+1-555-019-8822">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Delivery / Billing Address</label>
                  <textarea class="form-control" [(ngModel)]="formData.address" name="address" rows="3" placeholder="Suite, Street Address, City, Postal Code"></textarea>
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="saving || !formData.name">
                  <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ editingCustomer?.id ? 'Update Profile' : 'Create Account' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal fade show d-block" *ngIf="customerToDelete" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content border-0 shadow text-center p-3">
            <div class="text-danger my-3">
              <i class="bi bi-exclamation-triangle-fill display-4"></i>
            </div>
            <h6 class="fw-bold mb-2">Delete Customer Record?</h6>
            <p class="text-muted small mb-4">
              Are you sure you want to remove <strong>{{ customerToDelete.name }}</strong>? This action cannot be reversed.
            </p>
            <div class="d-flex justify-content-center gap-2">
              <button class="btn btn-sm btn-outline-secondary px-3" (click)="customerToDelete = null">Cancel</button>
              <button class="btn btn-sm btn-danger px-3" (click)="deleteConfirmed()" [disabled]="deleting">
                <span *ngIf="deleting" class="spinner-border spinner-border-sm me-1"></span>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-navy { color: #1a237e; }
    .bg-navy { background-color: #1a237e; }
    .fs-7 { font-size: 0.75rem; }
    .avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }
  `]
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  loading = false;
  saving = false;
  deleting = false;
  searchQuery = '';

  showModal = false;
  editingCustomer: Customer | null = null;
  customerToDelete: Customer | null = null;

  formData: Customer = {
    name: '',
    email: '',
    phone: '',
    address: ''
  };

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.api.getCustomers().subscribe({
      next: (res) => {
        this.customers = res.data || [];
        this.filteredCustomers = [...this.customers];
        this.loading = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to load customer directory');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredCustomers = [...this.customers];
      return;
    }
    this.filteredCustomers = this.customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  }

  openCustomerModal(c?: Customer): void {
    if (c) {
      this.editingCustomer = c;
      this.formData = { ...c };
    } else {
      this.editingCustomer = null;
      this.formData = { name: '', email: '', phone: '', address: '' };
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingCustomer = null;
  }

  saveCustomer(): void {
    if (!this.formData.name.trim()) return;

    this.saving = true;
    if (this.editingCustomer?.id) {
      this.api.updateCustomer(this.editingCustomer.id, this.formData).subscribe({
        next: (res) => {
          this.toast.success('Customer profile updated successfully');
          this.saving = false;
          this.closeModal();
          this.loadCustomers();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to update customer profile');
          this.saving = false;
        }
      });
    } else {
      this.api.createCustomer(this.formData).subscribe({
        next: (res) => {
          this.toast.success('New customer registered successfully');
          this.saving = false;
          this.closeModal();
          this.loadCustomers();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to register customer');
          this.saving = false;
        }
      });
    }
  }

  confirmDelete(c: Customer): void {
    this.customerToDelete = c;
  }

  deleteConfirmed(): void {
    if (!this.customerToDelete?.id) return;

    this.deleting = true;
    this.api.deleteCustomer(this.customerToDelete.id).subscribe({
      next: () => {
        this.toast.success('Customer record deleted successfully');
        this.deleting = false;
        this.customerToDelete = null;
        this.loadCustomers();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to delete customer profile');
        this.deleting = false;
      }
    });
  }
}
