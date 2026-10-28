import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Warehouse, StockBalance, StockMovement } from '../../core/models/models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Inventory Tracking & Stock Movements</h4>
          <p class="text-muted mb-0 small">Audit stock balances across locations, record manual adjustments, and execute transfers</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm rims-btn-secondary d-flex align-items-center gap-2" (click)="openTransferModal()" *ngIf="canTransfer()">
            <i class="bi bi-arrow-left-right"></i> Transfer Stock
          </button>
          <button class="btn btn-sm rims-btn-primary d-flex align-items-center gap-2" (click)="openMovementModal()">
            <i class="bi bi-plus-slash-minus"></i> Record Stock Change
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <ul class="nav nav-pills mb-4 gap-2">
        <li class="nav-item">
          <button class="nav-link py-2 px-3 fw-semibold rounded-pill"
                  [class.active]="activeTab === 'balances'"
                  (click)="activeTab = 'balances'">
            <i class="bi bi-stack me-1"></i> Multi-Location Balances
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link py-2 px-3 fw-semibold rounded-pill"
                  [class.active]="activeTab === 'movements'"
                  (click)="activeTab = 'movements'">
            <i class="bi bi-clock-history me-1"></i> Transaction Ledger
          </button>
        </li>
      </ul>

      <!-- Tab 1: Balances -->
      <div *ngIf="activeTab === 'balances'">
        <div class="rims-card p-3 mb-3">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-4">
              <label class="form-label small text-muted mb-1">Filter by Warehouse / Store:</label>
              <select class="form-select" [(ngModel)]="selectedWarehouseId" (change)="loadWarehouseBalances()">
                <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }} ({{ w.code }})</option>
              </select>
            </div>
            <div class="col-12 col-md-8 text-md-end pt-3">
              <span class="badge bg-light text-dark border p-2">
                Location Stock Count: {{ balances.length }} items
              </span>
            </div>
          </div>
        </div>

        <div class="rims-card overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Warehouse Code</th>
                  <th>Available Quantity</th>
                  <th>Unit Cost / Total Value</th>
                  <th>Last Movement</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let b of balances">
                  <td>
                    <div class="fw-semibold text-dark">{{ b.product.name }}</div>
                    <small class="text-muted">{{ b.product.categoryName || 'General' }}</small>
                  </td>
                  <td><code>{{ b.product.sku }}</code></td>
                  <td><span class="badge bg-light text-secondary border">{{ b.warehouse.code }}</span></td>
                  <td>
                    <span class="badge" [ngClass]="b.quantity > 0 ? 'badge-soft-success' : 'badge-soft-danger'">
                      {{ b.quantity }} in stock
                    </span>
                  </td>
                  <td>
                    <div>\${{ b.product.costPrice | number:'1.2-2' }}</div>
                    <small class="text-muted">Total: \${{ (b.product.costPrice * b.quantity) | number:'1.2-2' }}</small>
                  </td>
                  <td class="text-muted small">{{ b.lastUpdated | date:'medium' }}</td>
                </tr>
                <tr *ngIf="balances.length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">No stock balances found for this location.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 2: Transaction Ledger -->
      <div *ngIf="activeTab === 'movements'">
        <div class="rims-card overflow-hidden">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Reference #</th>
                  <th>Timestamp</th>
                  <th>Action Type</th>
                  <th>Product</th>
                  <th>Change Qty</th>
                  <th>Previous &rarr; New Stock</th>
                  <th>Responsible User</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of recentMovements">
                  <td><code class="fw-bold">{{ m.referenceNumber }}</code></td>
                  <td class="text-muted small">{{ m.timestamp | date:'short' }}</td>
                  <td>
                    <span class="badge" [ngClass]="{
                      'badge-soft-success': m.movementType === 'RECEIVING',
                      'badge-soft-info': m.movementType === 'SALE',
                      'badge-soft-warning': m.movementType === 'ADJUSTMENT',
                      'badge-soft-secondary': m.movementType === 'TRANSFER_OUT' || m.movementType === 'TRANSFER_IN'
                    }">
                      {{ m.movementType }}
                    </span>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">{{ m.product.name }}</div>
                    <small class="text-muted">SKU: {{ m.product.sku }}</small>
                  </td>
                  <td class="fw-bold" [ngClass]="m.movementType === 'RECEIVING' ? 'text-success' : (m.movementType === 'SALE' ? 'text-danger' : 'text-dark')">
                    {{ m.movementType === 'RECEIVING' ? '+' : (m.movementType === 'SALE' ? '-' : '') }}{{ m.quantity }}
                  </td>
                  <td>
                    <span class="text-muted">{{ m.previousStock }}</span> &rarr; <span class="fw-semibold text-dark">{{ m.newStock }}</span>
                  </td>
                  <td><span class="badge bg-light text-dark border">{{ m.userResponsible }}</span></td>
                  <td class="text-muted small" style="max-width: 220px;">{{ m.remarks || '&mdash;' }}</td>
                </tr>
                <tr *ngIf="recentMovements.length === 0">
                  <td colspan="8" class="text-center py-4 text-muted">No movement transactions logged.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Movement Modal -->
      <div class="modal fade show d-block" *ngIf="showMovementModal" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-dark">Record Stock Adjustment / Movement</h5>
              <button type="button" class="btn-close" (click)="showMovementModal = false"></button>
            </div>
            <form (ngSubmit)="submitMovement()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Product *</label>
                  <select class="form-select" [(ngModel)]="movementRequest.productId" name="productId" required>
                    <option *ngFor="let p of products" [value]="p.id">{{ p.name }} ({{ p.sku }}) - Current: {{ p.currentStock }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Warehouse / Store *</label>
                  <select class="form-select" [(ngModel)]="movementRequest.warehouseId" name="warehouseId" required>
                    <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }} ({{ w.code }})</option>
                  </select>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold small">Movement Type *</label>
                    <select class="form-select" [(ngModel)]="movementRequest.movementType" name="movementType" required>
                      <option value="RECEIVING">Receiving (Stock In)</option>
                      <option value="SALE">Manual Issue / Sale</option>
                      <option value="ADJUSTMENT">Inventory Audit Adjustment</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold small">Quantity *</label>
                    <input type="number" min="1" class="form-control" [(ngModel)]="movementRequest.quantity" name="quantity" required>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Reference # (Optional)</label>
                  <input type="text" class="form-control" [(ngModel)]="movementRequest.referenceNumber" name="ref" placeholder="e.g. AUDIT-2026-Q4">
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Reason / Remarks</label>
                  <textarea class="form-control" rows="2" [(ngModel)]="movementRequest.remarks" name="remarks" placeholder="Audit reconciliation, stock write-off, damaged goods..."></textarea>
                </div>
              </div>
              <div class="modal-footer border-top bg-light">
                <button type="button" class="btn btn-sm btn-secondary" (click)="showMovementModal = false">Cancel</button>
                <button type="submit" class="btn btn-sm rims-btn-primary" [disabled]="submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  Save Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Transfer Modal -->
      <div class="modal fade show d-block" *ngIf="showTransferModal" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-dark">Inter-Location Stock Transfer</h5>
              <button type="button" class="btn-close" (click)="showTransferModal = false"></button>
            </div>
            <form (ngSubmit)="submitTransfer()">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Product to Transfer *</label>
                  <select class="form-select" [(ngModel)]="transferRequest.productId" name="trfProductId" required>
                    <option *ngFor="let p of products" [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                  </select>
                </div>
                <div class="row g-2 mb-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold small">Source Location *</label>
                    <select class="form-select" [(ngModel)]="transferRequest.sourceWarehouseId" name="srcWh" required>
                      <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold small">Destination Location *</label>
                    <select class="form-select" [(ngModel)]="transferRequest.destinationWarehouseId" name="destWh" required>
                      <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }}</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Transfer Quantity *</label>
                  <input type="number" min="1" class="form-control" [(ngModel)]="transferRequest.quantity" name="trfQty" required>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold small">Transfer Notes</label>
                  <input type="text" class="form-control" [(ngModel)]="transferRequest.remarks" name="trfRemarks" placeholder="Internal transport notes...">
                </div>
              </div>
              <div class="modal-footer border-top bg-light">
                <button type="button" class="btn btn-sm btn-secondary" (click)="showTransferModal = false">Cancel</button>
                <button type="submit" class="btn btn-sm rims-btn-primary" [disabled]="submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InventoryComponent implements OnInit {
  activeTab: 'balances' | 'movements' = 'balances';

  warehouses: Warehouse[] = [];
  products: Product[] = [];
  balances: StockBalance[] = [];
  recentMovements: StockMovement[] = [];

  selectedWarehouseId?: number;

  showMovementModal = false;
  showTransferModal = false;
  submitting = false;

  movementRequest = {
    productId: 1,
    warehouseId: 1,
    movementType: 'RECEIVING',
    quantity: 10,
    referenceNumber: '',
    remarks: ''
  };

  transferRequest = {
    productId: 1,
    sourceWarehouseId: 1,
    destinationWarehouseId: 2,
    quantity: 5,
    remarks: ''
  };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadWarehouses();
    this.loadProducts();
    this.loadMovements();
  }

  loadWarehouses(): void {
    this.apiService.getWarehouses().subscribe({
      next: (res) => {
        if (res.success && res.data.length > 0) {
          this.warehouses = res.data;
          this.selectedWarehouseId = this.warehouses[0].id;
          this.loadWarehouseBalances();
        }
      }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (res) => { if (res.success) this.products = res.data; }
    });
  }

  loadWarehouseBalances(): void {
    if (!this.selectedWarehouseId) return;
    this.apiService.getWarehouseBalances(this.selectedWarehouseId).subscribe({
      next: (res) => { if (res.success) this.balances = res.data; }
    });
  }

  loadMovements(): void {
    this.apiService.getRecentMovements().subscribe({
      next: (res) => { if (res.success) this.recentMovements = res.data; }
    });
  }

  canTransfer(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_INVENTORY_MANAGER');
  }

  openMovementModal(): void {
    if (this.products.length > 0) this.movementRequest.productId = this.products[0].id!;
    if (this.warehouses.length > 0) this.movementRequest.warehouseId = this.warehouses[0].id!;
    this.showMovementModal = true;
  }

  openTransferModal(): void {
    if (this.products.length > 0) this.transferRequest.productId = this.products[0].id!;
    if (this.warehouses.length > 1) {
      this.transferRequest.sourceWarehouseId = this.warehouses[0].id!;
      this.transferRequest.destinationWarehouseId = this.warehouses[1].id!;
    }
    this.showTransferModal = true;
  }

  submitMovement(): void {
    this.submitting = true;
    this.apiService.recordStockMovement(this.movementRequest).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success) {
          this.toastService.success('Stock movement recorded successfully');
          this.showMovementModal = false;
          this.loadWarehouseBalances();
          this.loadMovements();
        }
      },
      error: () => this.submitting = false
    });
  }

  submitTransfer(): void {
    this.submitting = true;
    this.apiService.transferStock(this.transferRequest).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success) {
          this.toastService.success('Stock transferred successfully');
          this.showTransferModal = false;
          this.loadWarehouseBalances();
          this.loadMovements();
        }
      },
      error: () => this.submitting = false
    });
  }
}
