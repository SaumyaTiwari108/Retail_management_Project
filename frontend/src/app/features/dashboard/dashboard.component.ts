import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats } from '../../core/models/models';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Page Title & Actions -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Retail Operations Dashboard</h4>
          <p class="text-muted mb-0" style="font-size: 0.875rem;">Real-time inventory intelligence, supply chain metrics & sales activity</p>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <a routerLink="/products" class="btn btn-sm rims-btn-secondary d-flex align-items-center gap-1">
            <i class="bi bi-plus-circle"></i> Add Product
          </a>
          <a routerLink="/purchase-orders" class="btn btn-sm rims-btn-secondary d-flex align-items-center gap-1">
            <i class="bi bi-box-arrow-in-down"></i> Receive Stock
          </a>
          <a routerLink="/orders" class="btn btn-sm rims-btn-primary d-flex align-items-center gap-1">
            <i class="bi bi-cart-plus"></i> New POS Order
          </a>
          <button (click)="refreshData()" class="btn btn-sm btn-outline-secondary" [disabled]="loading" title="Refresh">
            <i class="bi bi-arrow-clockwise" [class.spin]="loading"></i>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading && !stats" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <div class="mt-2 text-muted">Aggregating live inventory statistics...</div>
      </div>

      <div *ngIf="stats">
        <!-- 8 KPI Metrics Cards Grid -->
        <div class="row g-3 mb-4">
          <!-- Total Products -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="rims-card p-3 h-100">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fw-semibold small text-uppercase">Total Products</div>
                  <h3 class="fw-bold text-dark mt-2 mb-0">{{ stats.totalProducts }}</h3>
                  <div class="text-muted small mt-1">Across {{ stats.totalCategories }} active categories</div>
                </div>
                <div class="rounded-3 p-3 bg-primary-subtle text-primary">
                  <i class="bi bi-boxes fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Inventory Valuation -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="rims-card p-3 h-100">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fw-semibold small text-uppercase">Inventory Valuation</div>
                  <h3 class="fw-bold text-dark mt-2 mb-0">\${{ stats.totalInventoryValue | number:'1.2-2' }}</h3>
                  <div class="text-success small mt-1 fw-medium"><i class="bi bi-graph-up-arrow"></i> Active asset cost</div>
                </div>
                <div class="rounded-3 p-3 bg-success-subtle text-success">
                  <i class="bi bi-currency-dollar fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Low Stock Alert -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="rims-card p-3 h-100" [ngClass]="{'border-warning': stats.lowStockCount > 0}">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fw-semibold small text-uppercase">Low Stock Alert</div>
                  <h3 class="fw-bold text-warning mt-2 mb-0">{{ stats.lowStockCount }}</h3>
                  <div class="text-muted small mt-1">Below reorder safety threshold</div>
                </div>
                <div class="rounded-3 p-3 bg-warning-subtle text-warning">
                  <i class="bi bi-exclamation-triangle fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Out of Stock -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="rims-card p-3 h-100" [ngClass]="{'border-danger': stats.outOfStockCount > 0}">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fw-semibold small text-uppercase">Out of Stock</div>
                  <h3 class="fw-bold text-danger mt-2 mb-0">{{ stats.outOfStockCount }}</h3>
                  <div class="text-danger small mt-1 fw-medium"><i class="bi bi-x-circle"></i> Requires replenishment</div>
                </div>
                <div class="rounded-3 p-3 bg-danger-subtle text-danger">
                  <i class="bi bi-slash-circle fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Pending POs -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="rims-card p-3 h-100">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fw-semibold small text-uppercase">Pending Inbound POs</div>
                  <h3 class="fw-bold text-dark mt-2 mb-0">{{ stats.pendingOrdersCount }}</h3>
                  <div class="text-muted small mt-1">Awaiting warehouse receipt</div>
                </div>
                <div class="rounded-3 p-3 bg-info-subtle text-info">
                  <i class="bi bi-box-arrow-in-down fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Active Suppliers -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="rims-card p-3 h-100">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fw-semibold small text-uppercase">Total Suppliers</div>
                  <h3 class="fw-bold text-dark mt-2 mb-0">{{ stats.totalSuppliers }}</h3>
                  <div class="text-muted small mt-1">Registered vendor network</div>
                </div>
                <div class="rounded-3 p-3 bg-secondary-subtle text-secondary">
                  <i class="bi bi-truck fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Gross Sales Revenue -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="rims-card p-3 h-100">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-muted fw-semibold small text-uppercase">Gross Sales Revenue</div>
                  <h3 class="fw-bold text-dark mt-2 mb-0">\${{ stats.totalRevenue | number:'1.2-2' }}</h3>
                  <div class="text-success small mt-1"><i class="bi bi-check2-circle"></i> Fulfilled orders</div>
                </div>
                <div class="rounded-3 p-3 bg-success-subtle text-success">
                  <i class="bi bi-receipt fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <!-- Reorder Assistant Shortcut -->
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="rims-card p-3 h-100 bg-primary text-white" style="cursor: pointer;" routerLink="/smart-reorder">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <div class="text-white-50 fw-semibold small text-uppercase">Inventory Assistant</div>
                  <div class="fw-bold fs-5 mt-2 mb-1">Smart Reorder</div>
                  <div class="text-white small">Automated replenishment logic &rarr;</div>
                </div>
                <div class="rounded-3 p-3 bg-white bg-opacity-25 text-white">
                  <i class="bi bi-cpu fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row g-3 mb-4">
          <!-- Sales Trend Chart -->
          <div class="col-12 col-lg-8">
            <div class="rims-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0">Sales Revenue Trend & Invoicing</h6>
                <span class="badge bg-light text-muted border">Monthly Performance</span>
              </div>
              <div style="height: 280px; position: relative;">
                <canvas #salesChart></canvas>
              </div>
            </div>
          </div>

          <!-- Stock by Category Distribution -->
          <div class="col-12 col-lg-4">
            <div class="rims-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0">Inventory by Category</h6>
                <span class="badge bg-light text-muted border">Stock Units</span>
              </div>
              <div style="height: 280px; position: relative;">
                <canvas #categoryChart></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Low Stock Alerts & Recent Movements -->
        <div class="row g-3">
          <!-- Low Stock Products Table -->
          <div class="col-12 col-lg-6">
            <div class="rims-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-2">
                  <h6 class="fw-bold text-dark mb-0">Priority Low-Stock Alerts</h6>
                  <span class="badge bg-warning text-dark">{{ stats.lowStockProducts.length }}</span>
                </div>
                <a routerLink="/smart-reorder" class="btn btn-sm btn-link text-decoration-none">View Recommendations &rarr;</a>
              </div>

              <div class="table-responsive" *ngIf="stats.lowStockProducts.length > 0; else noLowStock">
                <table class="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Current</th>
                      <th>Threshold</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of stats.lowStockProducts">
                      <td>
                        <div class="fw-semibold text-dark text-truncate" style="max-width: 180px;">{{ p.name }}</div>
                        <small class="text-muted">{{ p.categoryName || 'General' }}</small>
                      </td>
                      <td><code>{{ p.sku }}</code></td>
                      <td>
                        <span class="badge" [ngClass]="p.currentStock === 0 ? 'badge-soft-danger' : 'badge-soft-warning'">
                          {{ p.currentStock }} units
                        </span>
                      </td>
                      <td class="text-muted">{{ p.reorderLevel }}</td>
                      <td>
                        <a routerLink="/purchase-orders" class="btn btn-xs btn-outline-primary py-1 px-2" style="font-size: 0.75rem;">
                          Restock
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noLowStock>
                <div class="text-center py-4 text-muted">
                  <i class="bi bi-check-circle fs-3 text-success"></i>
                  <div class="mt-2">All product inventory levels are healthy!</div>
                </div>
              </ng-template>
            </div>
          </div>

          <!-- Recent Stock Transactions Ledger -->
          <div class="col-12 col-lg-6">
            <div class="rims-card p-4 h-100">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="fw-bold text-dark mb-0">Recent Stock Movements</h6>
                <a routerLink="/inventory" class="btn btn-sm btn-link text-decoration-none">Full Ledger &rarr;</a>
              </div>

              <div class="table-responsive" *ngIf="stats.recentMovements.length > 0; else noMovements">
                <table class="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Balance</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let m of stats.recentMovements">
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
                        <div class="fw-semibold text-truncate" style="max-width: 150px;">{{ m.product.name }}</div>
                        <small class="text-muted">{{ m.referenceNumber }}</small>
                      </td>
                      <td class="fw-semibold">
                        <span [class.text-success]="m.movementType === 'RECEIVING'" [class.text-danger]="m.movementType === 'SALE'">
                          {{ m.movementType === 'RECEIVING' ? '+' : '-' }}{{ m.quantity }}
                        </span>
                      </td>
                      <td>{{ m.newStock }}</td>
                      <td class="text-muted small">{{ m.timestamp | date:'shortTime' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ng-template #noMovements>
                <div class="text-center py-4 text-muted">
                  <i class="bi bi-clock-history fs-3"></i>
                  <div class="mt-2">No stock movements recorded yet.</div>
                </div>
              </ng-template>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .spin {
      animation: spin 1s infinite linear;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;

  stats: DashboardStats | null = null;
  loading = true;
  salesChartInstance: any;
  categoryChartInstance: any;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.refreshData();
  }

  ngAfterViewInit(): void {
    if (this.stats) {
      this.initCharts();
    }
  }

  refreshData(): void {
    this.loading = true;
    this.apiService.getDashboardStats().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.stats = res.data;
          setTimeout(() => this.initCharts(), 100);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private initCharts(): void {
    if (!this.stats) return;

    // Destroy existing instances if any
    if (this.salesChartInstance) this.salesChartInstance.destroy();
    if (this.categoryChartInstance) this.categoryChartInstance.destroy();

    // 1. Sales Chart
    if (this.salesChartRef) {
      const salesData = this.stats.monthlySales || {};
      const labels = Object.keys(salesData);
      const values = Object.values(salesData);

      this.salesChartInstance = new Chart(this.salesChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: labels.length ? labels : ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
          datasets: [{
            label: 'Monthly Revenue ($)',
            data: values.length ? values : [14200, 18500, 16300, 22400, 28900, 31200],
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#2563eb',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: '#f1f5f9' }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }

    // 2. Category Doughnut Chart
    if (this.categoryChartRef) {
      const catData = this.stats.stockByCategory || {};
      const catLabels = Object.keys(catData);
      const catValues = Object.values(catData);

      this.categoryChartInstance = new Chart(this.categoryChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: catLabels.length ? catLabels : ['Electronics', 'Apparel', 'Home', 'Office'],
          datasets: [{
            data: catValues.length ? catValues : [45, 20, 25, 10],
            backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } }
          },
          cutout: '70%'
        }
      });
    }
  }
}
