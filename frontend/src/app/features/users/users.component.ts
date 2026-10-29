import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { AppUser } from '../../core/models/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-3">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="fw-bold mb-1 text-navy">User & Role Management</h4>
          <p class="text-muted mb-0 small">Control operator credentials, role-based access levels, and security privileges</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2" (click)="openUserModal()">
          <i class="bi bi-person-badge-fill"></i>
          <span>Add System User</span>
        </button>
      </div>

      <!-- Security Info Banner -->
      <div class="alert alert-primary bg-primary-subtle border-0 d-flex align-items-center mb-4">
        <i class="bi bi-shield-lock-fill fs-4 text-primary me-3"></i>
        <div>
          <div class="fw-bold text-dark">Role-Based Access Control (RBAC) Active</div>
          <div class="small text-muted">
            <strong>Administrator</strong> has full control; <strong>Inventory Manager</strong> can manage catalog, POs, and stock; <strong>Staff</strong> is restricted to POS orders, receiving, and barcode lookups.
          </div>
        </div>
      </div>

      <!-- Users Table Card -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 border-bottom">
          <div class="row align-items-center g-2">
            <div class="col-md-5">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
                <input 
                  type="text" 
                  class="form-control border-start-0 ps-0" 
                  placeholder="Filter users by username, name, or email..." 
                  [(ngModel)]="searchQuery" 
                  (ngModelChange)="filterUsers()">
              </div>
            </div>
            <div class="col-md-7 text-md-end text-muted small">
              Total Operators: <strong>{{ filteredUsers.length }}</strong>
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light text-secondary text-uppercase fs-7 border-bottom">
                <tr>
                  <th class="ps-4 py-3">User</th>
                  <th>Full Name</th>
                  <th>Contact Email</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th class="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="loading">
                  <td colspan="7" class="text-center py-5 text-muted">
                    <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                    Loading authorized operators...
                  </td>
                </tr>

                <tr *ngFor="let u of filteredUsers">
                  <td class="ps-4">
                    <div class="d-flex align-items-center gap-2">
                      <div class="avatar-circle" [ngClass]="getRoleAvatarClass(u.role)">
                        {{ u.username.charAt(0).toUpperCase() }}
                      </div>
                      <div>
                        <div class="fw-bold text-dark font-monospace">{{ u.username }}</div>
                        <span *ngIf="isCurrentUser(u)" class="badge bg-secondary-subtle text-secondary fs-8">Current Session</span>
                      </div>
                    </div>
                  </td>
                  <td class="fw-semibold text-secondary">{{ u.fullName }}</td>
                  <td>
                    <span class="text-muted"><i class="bi bi-envelope me-1"></i>{{ u.email }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getRoleBadgeClass(u.role)">
                      <i class="bi me-1" [ngClass]="getRoleIcon(u.role)"></i>
                      {{ getRoleDisplay(u.role) }}
                    </span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="u.active ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'">
                      <i class="bi me-1" [ngClass]="u.active ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                      {{ u.active ? 'Active' : 'Deactivated' }}
                    </span>
                  </td>
                  <td class="small text-muted">{{ u.createdAt ? (u.createdAt | date:'mediumDate') : '—' }}</td>
                  <td class="text-end pe-4">
                    <div class="btn-group btn-group-sm">
                      <button class="btn btn-outline-secondary" (click)="openUserModal(u)" title="Edit Account">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button 
                        class="btn" 
                        [ngClass]="u.active ? 'btn-outline-warning' : 'btn-outline-success'" 
                        [disabled]="isCurrentUser(u)"
                        (click)="toggleStatus(u)" 
                        [title]="u.active ? 'Deactivate Operator' : 'Reactivate Operator'">
                        <i class="bi" [ngClass]="u.active ? 'bi-person-slash' : 'bi-person-check'"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add/Edit User Modal -->
      <div class="modal fade show d-block" *ngIf="showModal" tabindex="-1" style="background: rgba(0,0,0,0.5)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow">
            <div class="modal-header bg-navy text-white">
              <h5 class="modal-title fs-6 fw-bold">
                <i class="bi bi-person-fill-gear me-2"></i>
                {{ editingUser?.id ? 'Edit Operator Account' : 'Provision New System Operator' }}
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeModal()"></button>
            </div>
            <form (ngSubmit)="saveUser()">
              <div class="modal-body p-4">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Username <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control" 
                      [(ngModel)]="formData.username" 
                      name="username" 
                      [disabled]="!!editingUser?.id" 
                      required 
                      placeholder="e.g. jsmith">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">
                      Password <span *ngIf="!editingUser?.id" class="text-danger">*</span>
                    </label>
                    <input 
                      type="password" 
                      class="form-control" 
                      [(ngModel)]="formData.password" 
                      name="password" 
                      [required]="!editingUser?.id" 
                      [placeholder]="editingUser?.id ? 'Leave blank to retain' : 'Min 6 characters'">
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small">Full Display Name <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" [(ngModel)]="formData.fullName" name="fullName" required placeholder="e.g. Johnathan Smith">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small">Work Email Address <span class="text-danger">*</span></label>
                  <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" required placeholder="jsmith@xyzretail.com">
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold small">Assigned System Role <span class="text-danger">*</span></label>
                  <select class="form-select" [(ngModel)]="formData.role" name="role" required>
                    <option value="ROLE_ADMIN">Administrator (Full System Control)</option>
                    <option value="ROLE_INVENTORY_MANAGER">Inventory Manager (Catalogs, POs, Transfers)</option>
                    <option value="ROLE_STAFF">Staff Operator (POS, Barcode, Orders)</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer bg-light">
                <button type="button" class="btn btn-outline-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="saving">
                  <span *ngIf="saving" class="spinner-border spinner-border-sm me-1"></span>
                  {{ editingUser?.id ? 'Save Changes' : 'Provision Account' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-navy { color: #1a237e; }
    .bg-navy { background-color: #1a237e; }
    .fs-7 { font-size: 0.75rem; }
    .fs-8 { font-size: 0.70rem; }
    .avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }
  `]
})
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  filteredUsers: AppUser[] = [];
  loading = false;
  saving = false;
  searchQuery = '';

  showModal = false;
  editingUser: AppUser | null = null;

  formData: AppUser = {
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'ROLE_STAFF',
    active: true
  };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.api.getUsers().subscribe({
      next: (res) => {
        this.users = res.data || [];
        this.filteredUsers = [...this.users];
        this.loading = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to load user accounts');
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredUsers = [...this.users];
      return;
    }
    this.filteredUsers = this.users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  }

  isCurrentUser(u: AppUser): boolean {
    return this.auth.currentUserValue?.username === u.username;
  }

  getRoleDisplay(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'Administrator';
      case 'ROLE_INVENTORY_MANAGER': return 'Inventory Manager';
      case 'ROLE_STAFF': return 'Operations Staff';
      default: return role;
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'bg-danger-subtle text-danger border border-danger-subtle';
      case 'ROLE_INVENTORY_MANAGER': return 'bg-primary-subtle text-primary border border-primary-subtle';
      case 'ROLE_STAFF': return 'bg-info-subtle text-info-emphasis border border-info-subtle';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }

  getRoleAvatarClass(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'bg-danger text-white';
      case 'ROLE_INVENTORY_MANAGER': return 'bg-primary text-white';
      case 'ROLE_STAFF': return 'bg-info text-dark';
      default: return 'bg-secondary text-white';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN': return 'bi-shield-shaded';
      case 'ROLE_INVENTORY_MANAGER': return 'bi-boxes';
      case 'ROLE_STAFF': return 'bi-person';
      default: return 'bi-person';
    }
  }

  openUserModal(u?: AppUser): void {
    if (u) {
      this.editingUser = u;
      this.formData = {
        id: u.id,
        username: u.username,
        fullName: u.fullName,
        email: u.email,
        password: '',
        role: u.role,
        active: u.active
      };
    } else {
      this.editingUser = null;
      this.formData = {
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'ROLE_STAFF',
        active: true
      };
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingUser = null;
  }

  saveUser(): void {
    if (!this.formData.username.trim() || !this.formData.fullName.trim() || !this.formData.email.trim()) {
      this.toast.error('Please fill in all required fields');
      return;
    }

    this.saving = true;
    if (this.editingUser?.id) {
      this.api.updateUser(this.editingUser.id, this.formData).subscribe({
        next: () => {
          this.toast.success('User account updated successfully');
          this.saving = false;
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to update user');
          this.saving = false;
        }
      });
    } else {
      this.api.createUser(this.formData).subscribe({
        next: () => {
          this.toast.success('New operator created successfully');
          this.saving = false;
          this.closeModal();
          this.loadUsers();
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to create operator');
          this.saving = false;
        }
      });
    }
  }

  toggleStatus(u: AppUser): void {
    if (!u.id) return;
    this.api.toggleUserStatus(u.id).subscribe({
      next: (res) => {
        this.toast.success(`User ${u.username} status updated`);
        this.loadUsers();
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to update user status');
      }
    });
  }
}
