import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { PurchaseOrder, Supplier, Warehouse, Product, PurchaseOrderItem } from '../../core/models/models';

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Purchase Orders & Receiving</h4>
          <p class="text-muted mb-0 small">Create vendor POs, manage inbound deliveries, and receive inventory into warehouses</p>
        </div>
        <button *ngIf="canCreate()" class="btn btn-sm rims-btn-primary d-flex align-items-center gap-2" (click)="openCreateModal()">
          <i class="bi bi-plus-lg"></i> Create Purchase Order
        </button>
      </div>

      <!-- POs Table -->
      <div class="rims-card overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier</th>
                <th>Destination Hub</th>
                <th>Order Date</th>
                <th>Items Count</th>
                <th>Total Valuation</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let po of orders">
                <td><code class="fw-bold">{{ po.poNumber }}</code></td>
                <td>
                  <div class="fw-semibold text-dark">{{ po.supplierName }}</div>
                </td>
                <td>
                  <span class="badge bg-light text-secondary border">{{ po.warehouseName }}</span>
                </td>
                <td class="text-muted small">{{ po.orderDate | date:'mediumDate' }}</td>
                <td>
                  <span class="badge bg-secondary-subtle text-secondary">{{ po.items.length }} line items</span>
                </td>
                <td class="fw-bold text-dark">\${{ po.totalAmount | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-soft-success': po.status === 'RECEIVED',
                    'badge-soft-warning': po.status === 'PLACED',
                    'badge-soft-danger': po.status === 'CANCELLED',
                    'badge-soft-secondary': po.status === 'DRAFT'
                  }">
                    {{ po.status }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info" (click)="viewDetails(po)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button *ngIf="po.status === 'PLACED'"
                            class="btn btn-outline-success"
                            (click)="receiveOrder(po)"
                            title="Receive Inbound Stock">
                      <i class="bi bi-box-arrow-in-down me-1"></i> Receive
                    </button>
                    <button *ngIf="po.status === 'PLACED' && canCancel()"
                            class="btn btn-outline-danger"
                            (click)="cancelOrder(po)"
                            title="Cancel Order">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="orders.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">No purchase orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Modal -->
      <div class="modal fade show d-block" *ngIf="selectedPo" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom">
              <div>
                <h5 class="modal-title fw-bold text-dark mb-0">Purchase Order: {{ selectedPo.poNumber }}</h5>
                <span class="badge bg-primary-subtle text-primary small">Vendor: {{ selectedPo.supplierName }}</span>
              </div>
              <button type="button" class="btn-close" (click)="selectedPo = null"></button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-3 mb-4">
                <div class="col-sm-4">
                  <div class="text-muted small">Destination Warehouse</div>
                  <div class="fw-semibold">{{ selectedPo.warehouseName }}</div>
                </div>
                <div class="col-sm-4">
                  <div class="text-muted small">Status</div>
                  <span class="badge" [ngClass]="selectedPo.status === 'RECEIVED' ? 'badge-soft-success' : 'badge-soft-warning'">
                    {{ selectedPo.status }}
                  </span>
                </div>
                <div class="col-sm-4">
                  <div class="text-muted small">Ordered By</div>
                  <div class="fw-semibold">{{ selectedPo.createdByUser || 'Purchasing Team' }}</div>
                </div>
              </div>

              <h6 class="fw-bold text-dark mb-2">Order Line Items</h6>
              <div class="table-responsive">
                <table class="table table-sm table-bordered align-middle mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Qty Ordered</th>
                      <th>Qty Received</th>
                      <th>Unit Cost</th>
                      <th>Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of selectedPo.items">
                      <td class="fw-medium">{{ item.productName }}</td>
                      <td><code>{{ item.productSku }}</code></td>
                      <td>{{ item.quantityOrdered }}</td>
                      <td><span class="badge bg-light text-dark border">{{ item.quantityReceived || 0 }}</span></td>
                      <td>\${{ item.unitCost | number:'1.2-2' }}</td>
                      <td class="fw-bold">\${{ item.totalCost | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-light">
                      <td colspan="5" class="text-end fw-bold">Total Inbound Order Amount:</td>
                      <td class="fw-bold text-primary">\${{ selectedPo.totalAmount | number:'1.2-2' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div class="modal-footer border-top bg-light">
              <button type="button" class="btn btn-sm btn-secondary" (click)="selectedPo = null">Close</button>
              <button *ngIf="selectedPo.status === 'PLACED'"
                      type="button"
                      class="btn btn-sm btn-success d-flex align-items-center gap-1"
                      (click)="receiveOrder(selectedPo)">
                <i class="bi bi-box-arrow-in-down"></i> Receive Goods Into Warehouse
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create PO Modal -->
      <div class="modal fade show d-block" *ngIf="showCreateModal" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-dark">Issue New Purchase Order</h5>
              <button type="button" class="btn-close" (click)="showCreateModal = false"></button>
            </div>
            <form (ngSubmit)="submitPurchaseOrder()">
              <div class="modal-body p-4">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Supplier *</label>
                    <select class="form-select" [(ngModel)]="newPo.supplierId" name="supId" required>
                      <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }}</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Receiving Destination Warehouse *</label>
                    <select class="form-select" [(ngModel)]="newPo.warehouseId" name="whId" required>
                      <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }} ({{ w.code }})</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Expected Delivery Date</label>
                    <input type="date" class="form-control" [(ngModel)]="newPo.expectedDeliveryDate" name="expDate">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Purchasing Notes</label>
                    <input type="text" class="form-control" [(ngModel)]="newPo.notes" name="notes" placeholder="Delivery instructions...">
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mt-4 mb-2">
                  <h6 class="fw-bold text-dark mb-0">Inbound Line Items</h6>
                  <button type="button" class="btn btn-xs btn-outline-primary" (click)="addLineItem()">
                    <i class="bi bi-plus"></i> Add Item
                  </button>
                </div>

                <div class="table-responsive mb-3">
                  <table class="table table-sm align-middle">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style="width: 140px;">Quantity</th>
                        <th style="width: 140px;">Unit Cost ($)</th>
                        <th style="width: 120px;">Subtotal</th>
                        <th style="width: 40px;"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of newPo.items; let i = index">
                        <td>
                          <select class="form-select form-select-sm" [(ngModel)]="item.productId" [name]="'itemProd_' + i" (change)="onProductChange(item)">
                            <option *ngFor="let p of products" [value]="p.id">{{ p.name }} ({{ p.sku }})</option>
                          </select>
                        </td>
                        <td>
                          <input type="number" min="1" class="form-control form-control-sm" [(ngModel)]="item.quantityOrdered" [name]="'itemQty_' + i">
                        </td>
                        <td>
                          <input type="number" step="0.01" min="0" class="form-control form-control-sm" [(ngModel)]="item.unitCost" [name]="'itemCost_' + i">
                        </td>
                        <td class="fw-bold small">
                          \${{ (item.quantityOrdered * item.unitCost) | number:'1.2-2' }}
                        </td>
                        <td>
                          <button type="button" class="btn btn-sm text-danger p-0" (click)="removeLineItem(i)" [disabled]="newPo.items.length === 1">
                            <i class="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" class="text-end fw-bold">Order Total:</td>
                        <td colspan="2" class="fw-bold text-primary fs-6">\${{ calculateNewPoTotal() | number:'1.2-2' }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div class="modal-footer border-top bg-light">
                <button type="button" class="btn btn-sm btn-secondary" (click)="showCreateModal = false">Cancel</button>
                <button type="submit" class="btn btn-sm rims-btn-primary" [disabled]="submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  Confirm & Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PurchaseOrdersComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  suppliers: Supplier[] = [];
  warehouses: Warehouse[] = [];
  products: Product[] = [];

  selectedPo: PurchaseOrder | null = null;
  showCreateModal = false;
  submitting = false;

  newPo: PurchaseOrder = {
    supplierId: 1,
    warehouseId: 1,
    status: 'PLACED',
    items: []
  };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadSuppliers();
    this.loadWarehouses();
    this.loadProducts();
  }

  loadOrders(): void {
    this.apiService.getPurchaseOrders().subscribe({
      next: (res) => { if (res.success) this.orders = res.data; }
    });
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe({
      next: (res) => {
        if (res.success) {
          this.suppliers = res.data;
          if (this.suppliers.length > 0) this.newPo.supplierId = this.suppliers[0].id!;
        }
      }
    });
  }

  loadWarehouses(): void {
    this.apiService.getWarehouses().subscribe({
      next: (res) => {
        if (res.success) {
          this.warehouses = res.data;
          if (this.warehouses.length > 0) this.newPo.warehouseId = this.warehouses[0].id!;
        }
      }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (res) => { if (res.success) this.products = res.data; }
    });
  }

  canCreate(): boolean {
    return this.authService.hasRole('ROLE_ADMIN') || this.authService.hasRole('ROLE_INVENTORY_MANAGER');
  }

  canCancel(): boolean {
    return this.authService.hasRole('ROLE_ADMIN');
  }

  viewDetails(po: PurchaseOrder): void {
    this.selectedPo = po;
  }

  openCreateModal(): void {
    this.newPo = {
      supplierId: this.suppliers[0]?.id || 1,
      warehouseId: this.warehouses[0]?.id || 1,
      status: 'PLACED',
      items: [{
        productId: this.products[0]?.id || 1,
        quantityOrdered: 20,
        unitCost: this.products[0]?.costPrice || 10
      }]
    };
    this.showCreateModal = true;
  }

  addLineItem(): void {
    if (this.products.length === 0) return;
    this.newPo.items.push({
      productId: this.products[0].id!,
      quantityOrdered: 10,
      unitCost: this.products[0].costPrice || 10
    });
  }

  removeLineItem(idx: number): void {
    if (this.newPo.items.length > 1) {
      this.newPo.items.splice(idx, 1);
    }
  }

  onProductChange(item: PurchaseOrderItem): void {
    const prod = this.products.find(p => p.id === Number(item.productId));
    if (prod) {
      item.unitCost = prod.costPrice;
    }
  }

  calculateNewPoTotal(): number {
    return this.newPo.items.reduce((sum, item) => sum + (item.quantityOrdered * item.unitCost), 0);
  }

  submitPurchaseOrder(): void {
    this.submitting = true;
    this.apiService.createPurchaseOrder(this.newPo).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success) {
          this.toastService.success(`Purchase order ${res.data.poNumber} created successfully`);
          this.showCreateModal = false;
          this.loadOrders();
        }
      },
      error: () => this.submitting = false
    });
  }

  receiveOrder(po: PurchaseOrder): void {
    if (confirm(`Confirm delivery receipt for PO ${po.poNumber}? Stock balances will be updated immediately.`)) {
      this.apiService.receivePurchaseOrder(po.id!).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.success(`Stock received and added to inventory for ${po.poNumber}`);
            if (this.selectedPo && this.selectedPo.id === po.id) {
              this.selectedPo = null;
            }
            this.loadOrders();
          }
        }
      });
    }
  }

  cancelOrder(po: PurchaseOrder): void {
    if (confirm(`Cancel purchase order ${po.poNumber}?`)) {
      this.apiService.updatePurchaseOrderStatus(po.id!, 'CANCELLED').subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.warning(`Purchase order ${po.poNumber} cancelled`);
            this.loadOrders();
          }
        }
      });
    }
  }
}
