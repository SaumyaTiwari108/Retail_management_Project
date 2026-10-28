import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Product, Supplier, PurchaseOrder, CustomerOrder } from '../../core/models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Reports & Executive Analytics</h4>
          <p class="text-muted mb-0 small">Export inventory audits, sales turnover, supplier expenditures and valuations</p>
        </div>
        <button class="btn btn-sm btn-success d-flex align-items-center gap-2" (click)="downloadCsv()">
          <i class="bi bi-file-earmark-excel"></i> Export Inventory CSV
        </button>
      </div>

      <!-- Report View Selector Tabs -->
      <div class="rims-card p-3 mb-4">
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-sm" [ngClass]="selectedReport === 'valuation' ? 'btn-primary' : 'btn-outline-secondary'" (click)="selectedReport = 'valuation'">
            <i class="bi bi-pie-chart me-1"></i> Stock Valuation & Cost
          </button>
          <button class="btn btn-sm" [ngClass]="selectedReport === 'lowstock' ? 'btn-primary' : 'btn-outline-secondary'" (click)="selectedReport = 'lowstock'">
            <i class="bi bi-exclamation-triangle me-1"></i> Low Stock & Depletion
          </button>
          <button class="btn btn-sm" [ngClass]="selectedReport === 'purchases' ? 'btn-primary' : 'btn-outline-secondary'" (click)="selectedReport = 'purchases'">
            <i class="bi bi-truck me-1"></i> Supplier Purchasing
          </button>
          <button class="btn btn-sm" [ngClass]="selectedReport === 'sales' ? 'btn-primary' : 'btn-outline-secondary'" (click)="selectedReport = 'sales'">
            <i class="bi bi-receipt me-1"></i> Customer Sales Ledger
          </button>
        </div>
      </div>

      <!-- Report Content -->
      <div class="rims-card overflow-hidden">
        <!-- 1. Stock Valuation Report -->
        <div *ngIf="selectedReport === 'valuation'" class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-bold text-dark mb-0">Product Asset Valuation & Margin Summary</h6>
            <span class="badge bg-light text-dark border">Total Catalog Items: {{ products.length }}</span>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Cost Basis</th>
                  <th>Retail Price</th>
                  <th>Gross Margin</th>
                  <th>Total Cost Valuation</th>
                  <th>Potential Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of products">
                  <td class="fw-semibold">{{ p.name }}</td>
                  <td><code>{{ p.sku }}</code></td>
                  <td><span class="badge bg-light text-dark border">{{ p.currentStock }}</span></td>
                  <td>\${{ p.costPrice | number:'1.2-2' }}</td>
                  <td>\${{ p.sellingPrice | number:'1.2-2' }}</td>
                  <td class="text-success fw-medium">
                    {{ (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100) | number:'1.1-1' }}%
                  </td>
                  <td class="fw-bold text-dark">\${{ (p.costPrice * p.currentStock) | number:'1.2-2' }}</td>
                  <td class="fw-bold text-primary">\${{ (p.sellingPrice * p.currentStock) | number:'1.2-2' }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-light">
                  <td colspan="6" class="text-end fw-bold">Consolidated Portfolio Valuation:</td>
                  <td class="fw-bold fs-6 text-dark">\${{ totalValuation | number:'1.2-2' }}</td>
                  <td class="fw-bold fs-6 text-primary">\${{ totalPotentialRevenue | number:'1.2-2' }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <!-- 2. Low Stock Report -->
        <div *ngIf="selectedReport === 'lowstock'" class="p-4">
          <h6 class="fw-bold text-dark mb-3">Low & Depleted Stock Audit Report</h6>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Units</th>
                  <th>Reorder Level</th>
                  <th>Deficit Units</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of lowStockProducts">
                  <td class="fw-semibold">{{ p.name }}</td>
                  <td>{{ p.categoryName || 'General' }}</td>
                  <td>
                    <span class="badge" [ngClass]="p.currentStock === 0 ? 'badge-soft-danger' : 'badge-soft-warning'">
                      {{ p.currentStock }}
                    </span>
                  </td>
                  <td>{{ p.reorderLevel }}</td>
                  <td class="text-danger fw-bold">-{{ p.reorderLevel - p.currentStock }}</td>
                  <td>
                    <span class="badge" [ngClass]="p.currentStock === 0 ? 'bg-danger' : 'bg-warning text-dark'">
                      {{ p.currentStock === 0 ? 'STOCKOUT' : 'DEPLETED' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="lowStockProducts.length === 0">
                  <td colspan="6" class="text-center py-4 text-success"><i class="bi bi-check-circle me-1"></i>No low stock items!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. Purchases Report -->
        <div *ngIf="selectedReport === 'purchases'" class="p-4">
          <h6 class="fw-bold text-dark mb-3">Vendor Procurement & Spend Report</h6>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Vendor</th>
                  <th>Warehouse</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th class="text-end">PO Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let po of purchaseOrders">
                  <td><code>{{ po.poNumber }}</code></td>
                  <td class="fw-semibold">{{ po.supplierName }}</td>
                  <td>{{ po.warehouseName }}</td>
                  <td>{{ po.orderDate | date:'mediumDate' }}</td>
                  <td><span class="badge badge-soft-info">{{ po.status }}</span></td>
                  <td class="text-end fw-bold">\${{ po.totalAmount | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. Sales Report -->
        <div *ngIf="selectedReport === 'sales'" class="p-4">
          <h6 class="fw-bold text-dark mb-3">Retail Customer Sales Ledger</h6>
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Payment Method</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th class="text-end">Net Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let so of salesOrders">
                  <td><code>{{ so.orderNumber }}</code></td>
                  <td class="fw-semibold">{{ so.customerName }}</td>
                  <td>{{ so.paymentMethod }}</td>
                  <td>{{ so.orderDate | date:'mediumDate' }}</td>
                  <td><span class="badge badge-soft-success">{{ so.status }}</span></td>
                  <td class="text-end fw-bold text-success">\${{ so.totalAmount | number:'1.2-2' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  selectedReport: 'valuation' | 'lowstock' | 'purchases' | 'sales' = 'valuation';

  products: Product[] = [];
  lowStockProducts: Product[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  salesOrders: CustomerOrder[] = [];

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.apiService.getProducts().subscribe(res => {
      if (res.success) {
        this.products = res.data;
        this.lowStockProducts = res.data.filter(p => p.currentStock <= p.reorderLevel);
      }
    });

    this.apiService.getPurchaseOrders().subscribe(res => {
      if (res.success) this.purchaseOrders = res.data;
    });

    this.apiService.getCustomerOrders().subscribe(res => {
      if (res.success) this.salesOrders = res.data;
    });
  }

  get totalValuation(): number {
    return this.products.reduce((acc, p) => acc + (p.costPrice * p.currentStock), 0);
  }

  get totalPotentialRevenue(): number {
    return this.products.reduce((acc, p) => acc + (p.sellingPrice * p.currentStock), 0);
  }

  downloadCsv(): void {
    this.apiService.exportInventoryCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rims_inventory_report_${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastService.success('Inventory CSV export downloaded successfully');
      },
      error: () => this.toastService.error('Failed to generate CSV export')
    });
  }
}
