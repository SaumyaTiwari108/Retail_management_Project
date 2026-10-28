import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Category } from '../../core/models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Products & Catalog Management</h4>
          <p class="text-muted mb-0 small">Manage SKUs, barcodes, pricing, stock levels, and category classifications</p>
        </div>
        <div class="d-flex gap-2">
          <button *ngIf="canEdit()" class="btn btn-sm rims-btn-primary d-flex align-items-center gap-2" (click)="openCreateModal()">
            <i class="bi bi-plus-lg"></i> Add New Product
          </button>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="rims-card p-3 mb-4">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-4">
            <div class="input-group">
              <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
              <input type="text"
                     class="form-control border-start-0"
                     placeholder="Search SKU, name, or barcode..."
                     [(ngModel)]="searchQuery"
                     (input)="applyFilters()">
            </div>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="selectedCategory" (change)="applyFilters()">
              <option value="">All Categories</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="col-6 col-md-3">
            <select class="form-select" [(ngModel)]="stockStatusFilter" (change)="applyFilters()">
              <option value="ALL">All Stock Levels</option>
              <option value="LOW">Low Stock Only</option>
              <option value="OUT">Out of Stock</option>
              <option value="IN_STOCK">Adequate Stock</option>
            </select>
          </div>
          <div class="col-12 col-md-2 text-md-end">
            <span class="text-muted small fw-medium">Showing {{ filteredProducts.length }} of {{ products.length }} items</span>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="rims-card overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Product & Brand</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Cost / Sell Price</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th class="text-end" *ngIf="canEdit()">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of pagedProducts">
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <img [src]="p.imageUrl || 'https://placehold.co/48x48?text=Product'"
                         alt="thumbnail"
                         class="rounded border bg-light"
                         style="width: 44px; height: 44px; object-fit: cover;">
                    <div>
                      <div class="fw-semibold text-dark">{{ p.name }}</div>
                      <small class="text-muted">{{ p.brand || 'Generic' }}</small>
                    </div>
                  </div>
                </td>
                <td><code class="fw-bold">{{ p.sku }}</code></td>
                <td>
                  <span *ngIf="p.barcode" class="badge bg-light text-secondary border font-monospace">
                    <i class="bi bi-upc me-1"></i>{{ p.barcode }}
                  </span>
                  <span *ngIf="!p.barcode" class="text-muted small">&mdash;</span>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">{{ p.categoryName || 'General' }}</span>
                </td>
                <td>
                  <div class="fw-semibold text-dark">\${{ p.sellingPrice | number:'1.2-2' }}</div>
                  <small class="text-muted">Cost: \${{ p.costPrice | number:'1.2-2' }}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge" [ngClass]="{
                      'badge-soft-danger': p.currentStock === 0,
                      'badge-soft-warning': p.currentStock > 0 && p.currentStock <= p.reorderLevel,
                      'badge-soft-success': p.currentStock > p.reorderLevel
                    }">
                      {{ p.currentStock }} units
                    </span>
                  </div>
                  <small class="text-muted">Reorder at {{ p.reorderLevel }}</small>
                </td>
                <td>
                  <span class="badge" [ngClass]="p.active ? 'badge-soft-success' : 'badge-soft-secondary'">
                    {{ p.active ? 'Active' : 'Archived' }}
                  </span>
                </td>
                <td class="text-end" *ngIf="canEdit()">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" (click)="openEditModal(p)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" (click)="deleteProduct(p)" title="Deactivate" *ngIf="isAdmin()">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredProducts.length === 0">
                <td colspan="8" class="text-center py-5 text-muted">
                  <i class="bi bi-inbox fs-2"></i>
                  <div class="mt-2 fw-medium">No products match the selected criteria.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="p-3 border-top d-flex justify-content-between align-items-center" *ngIf="totalPages > 1">
          <span class="text-muted small">Page {{ currentPage }} of {{ totalPages }}</span>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" [disabled]="currentPage === 1" (click)="currentPage = currentPage - 1">
              Previous
            </button>
            <button class="btn btn-outline-secondary" [disabled]="currentPage === totalPages" (click)="currentPage = currentPage + 1">
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Add / Edit Modal Dialog -->
      <div class="modal fade show d-block" *ngIf="showModal" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-dark">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h5>
              <button type="button" class="btn-close" (click)="closeModal()"></button>
            </div>
            <form (ngSubmit)="saveProduct()">
              <div class="modal-body p-4">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Product Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="currentProduct.name" name="name" required placeholder="e.g. Ergonomic Office Chair">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">SKU Code *</label>
                    <input type="text" class="form-control font-monospace" [(ngModel)]="currentProduct.sku" name="sku" required placeholder="e.g. SKU-OFF-002">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Category *</label>
                    <select class="form-select" [(ngModel)]="currentProduct.categoryId" name="categoryId" required>
                      <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Brand</label>
                    <input type="text" class="form-control" [(ngModel)]="currentProduct.brand" name="brand" placeholder="e.g. ErgoLine">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Barcode / EAN (Scanner value)</label>
                    <div class="input-group">
                      <input type="text" class="form-control font-monospace" [(ngModel)]="currentProduct.barcode" name="barcode" placeholder="e.g. 890100100999">
                      <button type="button" class="btn btn-outline-secondary" (click)="generateBarcode()" title="Generate Barcode">Generate</button>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Image URL</label>
                    <input type="url" class="form-control" [(ngModel)]="currentProduct.imageUrl" name="imageUrl" placeholder="https://...">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-semibold small">Cost Price ($) *</label>
                    <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="currentProduct.costPrice" name="costPrice" required>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-semibold small">Selling Price ($) *</label>
                    <input type="number" step="0.01" min="0" class="form-control" [(ngModel)]="currentProduct.sellingPrice" name="sellingPrice" required>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-semibold small">Initial Stock Qty</label>
                    <input type="number" min="0" class="form-control" [(ngModel)]="currentProduct.currentStock" name="currentStock" [disabled]="isEditing">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label fw-semibold small">Reorder Threshold *</label>
                    <input type="number" min="0" class="form-control" [(ngModel)]="currentProduct.reorderLevel" name="reorderLevel" required>
                  </div>
                  <div class="col-12">
                    <label class="form-label fw-semibold small">Product Description</label>
                    <textarea class="form-control" rows="2" [(ngModel)]="currentProduct.description" name="description" placeholder="Product specifications and details..."></textarea>
                  </div>
                  <div class="col-12">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="activeStatus" [(ngModel)]="currentProduct.active" name="active">
                      <label class="form-check-label small fw-medium" for="activeStatus">Active for retail catalog & sales orders</label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-footer border-top bg-light">
                <button type="button" class="btn btn-sm btn-secondary" (click)="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-sm rims-btn-primary" [disabled]="submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  {{ isEditing ? 'Save Changes' : 'Create Product' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];

  searchQuery = '';
  selectedCategory = '';
  stockStatusFilter = 'ALL';

  currentPage = 1;
  pageSize = 10;

  showModal = false;
  isEditing = false;
  submitting = false;

  currentProduct: Product = this.getEmptyProduct();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();

    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.applyFilters();
      }
    });
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (res) => { if (res.success) this.categories = res.data; }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (res) => {
        if (res.success) {
          this.products = res.data;
          this.applyFilters();
        }
      }
    });
  }

  applyFilters(): void {
    let result = [...this.products];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q))
      );
    }

    if (this.selectedCategory) {
      const catId = Number(this.selectedCategory);
      result = result.filter(p => p.categoryId === catId);
    }

    if (this.stockStatusFilter === 'LOW') {
      result = result.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderLevel);
    } else if (this.stockStatusFilter === 'OUT') {
      result = result.filter(p => p.currentStock === 0);
    } else if (this.stockStatusFilter === 'IN_STOCK') {
      result = result.filter(p => p.currentStock > p.reorderLevel);
    }

    this.filteredProducts = result;
    this.currentPage = 1;
  }

  get pagedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  canEdit(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_INVENTORY_MANAGER');
  }

  isAdmin(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  openCreateModal(): void {
    this.isEditing = false;
    this.currentProduct = this.getEmptyProduct();
    if (this.categories.length > 0) {
      this.currentProduct.categoryId = this.categories[0].id!;
    }
    this.showModal = true;
  }

  openEditModal(p: Product): void {
    this.isEditing = true;
    this.currentProduct = { ...p };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  generateBarcode(): void {
    this.currentProduct.barcode = '890' + Math.floor(100000000 + Math.random() * 900000000);
  }

  saveProduct(): void {
    this.submitting = true;
    if (this.isEditing && this.currentProduct.id) {
      this.apiService.updateProduct(this.currentProduct.id, this.currentProduct).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.toastService.success('Product updated successfully');
            this.closeModal();
            this.loadProducts();
          }
        },
        error: () => this.submitting = false
      });
    } else {
      this.apiService.createProduct(this.currentProduct).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.success) {
            this.toastService.success('Product created successfully');
            this.closeModal();
            this.loadProducts();
          }
        },
        error: () => this.submitting = false
      });
    }
  }

  deleteProduct(p: Product): void {
    if (confirm(`Are you sure you want to deactivate ${p.name}?`)) {
      this.apiService.deleteProduct(p.id!).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success('Product deactivated');
            this.loadProducts();
          }
        }
      });
    }
  }

  private getEmptyProduct(): Product {
    return {
      sku: '',
      name: '',
      description: '',
      categoryId: 1,
      brand: '',
      barcode: '',
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      reorderLevel: 10,
      imageUrl: '',
      active: true
    };
  }
}
