import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Category } from '../../core/models/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Product Category Taxonomy</h4>
          <p class="text-muted mb-0 small">Organize retail inventory hierarchy, product grouping and reporting classes</p>
        </div>
        <button *ngIf="canEdit()" class="btn btn-sm rims-btn-primary d-flex align-items-center gap-2" (click)="openCreateModal()">
          <i class="bi bi-plus-lg"></i> Add Category
        </button>
      </div>

      <!-- Categories Table Card -->
      <div class="rims-card overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Created Date</th>
                <th class="text-end" *ngIf="canEdit()">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of categories">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div class="bg-primary-subtle text-primary p-2 rounded">
                      <i class="bi bi-tag-fill"></i>
                    </div>
                    <span class="fw-bold text-dark">{{ c.name }}</span>
                  </div>
                </td>
                <td class="text-muted">{{ c.description || 'No description provided' }}</td>
                <td>
                  <span class="badge" [ngClass]="c.active ? 'badge-soft-success' : 'badge-soft-secondary'">
                    {{ c.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="text-muted small">{{ c.createdAt | date:'mediumDate' }}</td>
                <td class="text-end" *ngIf="canEdit()">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" (click)="openEditModal(c)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="deleteCategory(c)" title="Delete" *ngIf="isAdmin()">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="categories.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">No categories defined yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Category Modal -->
      <div class="modal fade show d-block" *ngIf="showModal" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-dark">{{ isEditing ? 'Edit Category' : 'Create Category' }}</h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <form (ngSubmit)="saveCategory()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Category Name *</label>
                  <input type="text" class="form-control" [(ngModel)]="currentCategory.name" name="name" required placeholder="e.g. Footwear & Apparel">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Description</label>
                  <textarea class="form-control" rows="3" [(ngModel)]="currentCategory.description" name="description" placeholder="Brief explanation of product classification..."></textarea>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="catActive" [(ngModel)]="currentCategory.active" name="active">
                  <label class="form-check-label small fw-medium" for="catActive">Active category</label>
                </div>
              </div>
              <div class="modal-footer border-top bg-light">
                <button type="button" class="btn btn-sm btn-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-sm rims-btn-primary" [disabled]="submitting || !currentCategory.name">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEditing ? 'Save Changes' : 'Create Category' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  showModal = false;
  isEditing = false;
  submitting = false;

  currentCategory: Category = { name: '', description: '', active: true };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (res) => { if (res.success) this.categories = res.data; }
    });
  }

  canEdit(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_INVENTORY_MANAGER');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentCategory = { name: '', description: '', active: true };
    this.showModal = true;
  }

  openEditModal(c: Category): void {
    this.isEditing = true;
    this.currentCategory = { ...c };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCategory(): void {
    if (!this.currentCategory.name.trim()) return;
    this.submitting = true;

    if (this.isEditing && this.currentCategory.id) {
      this.apiService.updateCategory(this.currentCategory.id, this.currentCategory).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.toastService.success('Category updated successfully');
            this.closeModal();
            this.loadCategories();
          }
        },
        error: () => this.submitting = false
      });
    } else {
      this.apiService.createCategory(this.currentCategory).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.toastService.success('Category created successfully');
            this.closeModal();
            this.loadCategories();
          }
        },
        error: () => this.submitting = false
      });
    }
  }

  deleteCategory(c: Category): void {
    if (confirm(`Are you sure you want to delete category "${c.name}"?`)) {
      this.apiService.deleteCategory(c.id!).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Category deleted successfully');
            this.loadCategories();
          }
        }
      });
    }
  }
}
