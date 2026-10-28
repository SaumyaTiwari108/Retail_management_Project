import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { CustomerOrder, CustomerOrderItem, Warehouse, Product } from '../../core/models/models';

@Component({
  selector: 'app-sales-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Customer Sales & Order Fulfilment</h4>
          <p class="text-muted mb-0 small">Process retail POS transactions, generate invoices, track status, and manage returns</p>
        </div>
        <button class="btn btn-sm rims-btn-primary d-flex align-items-center gap-2" (click)="openCreateModal()">
          <i class="bi bi-cart-plus"></i> New Sales Order / POS
        </button>
      </div>

      <!-- Orders List Card -->
      <div class="rims-card overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Fulfilled From</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Order Total</th>
                <th>Status</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let o of orders">
                <td><code class="fw-bold">{{ o.orderNumber }}</code></td>
                <td>
                  <div class="fw-semibold text-dark">{{ o.customerName }}</div>
                  <small class="text-muted">{{ o.customerPhone || o.customerEmail || 'Walk-in' }}</small>
                </td>
                <td><span class="badge bg-light text-secondary border">{{ o.warehouseName }}</span></td>
                <td class="text-muted small">{{ o.orderDate | date:'mediumDate' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-soft-success': o.paymentStatus === 'PAID',
                    'badge-soft-warning': o.paymentStatus === 'UNPAID',
                    'badge-soft-danger': o.paymentStatus === 'REFUNDED'
                  }">
                    {{ o.paymentStatus }} ({{ o.paymentMethod }})
                  </span>
                </td>
                <td class="fw-bold text-dark">\${{ o.totalAmount | number:'1.2-2' }}</td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-soft-success': o.status === 'DELIVERED',
                    'badge-soft-info': o.status === 'SHIPPED' || o.status === 'CONFIRMED',
                    'badge-soft-warning': o.status === 'PROCESSING' || o.status === 'PENDING',
                    'badge-soft-danger': o.status === 'CANCELLED'
                  }">
                    {{ o.status }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" (click)="viewInvoice(o)" title="View & Print Invoice">
                      <i class="bi bi-receipt"></i> Invoice
                    </button>
                    <button *ngIf="o.status !== 'CANCELLED' && o.status !== 'DELIVERED'"
                            class="btn btn-outline-danger"
                            (click)="cancelOrder(o)"
                            title="Cancel Order (Restores Stock)">
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="orders.length === 0">
                <td colspan="8" class="text-center py-4 text-muted">No sales orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Printable Invoice Modal -->
      <div class="modal fade show d-block" *ngIf="invoiceOrder" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom d-print-none">
              <h5 class="modal-title fw-bold text-dark">Retail Customer Invoice</h5>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-sm btn-outline-primary" (click)="printInvoice()">
                  <i class="bi bi-printer me-1"></i> Print
                </button>
                <button type="button" class="btn-close" (click)="invoiceOrder = null"></button>
              </div>
            </div>

            <!-- Invoice Printable Surface -->
            <div class="modal-body p-4 p-md-5" id="printableInvoice">
              <div class="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                <div>
                  <h4 class="fw-bold text-primary mb-1">XYZ RETAIL CORPORATION</h4>
                  <div class="text-muted small">Enterprise Inventory & Retail Systems</div>
                  <div class="text-muted small">Tax ID: US-XYZ-99482011 &bull; Phone: +1-800-555-RETAIL</div>
                </div>
                <div class="text-end">
                  <h5 class="fw-bold text-dark mb-1">INVOICE</h5>
                  <div class="text-muted small">Invoice #: <strong>{{ invoiceOrder.orderNumber }}</strong></div>
                  <div class="text-muted small">Date: {{ invoiceOrder.orderDate | date:'mediumDate' }}</div>
                </div>
              </div>

              <div class="row g-4 mb-4">
                <div class="col-6">
                  <div class="text-uppercase text-muted fw-bold small mb-1">Billed To</div>
                  <div class="fw-bold text-dark fs-6">{{ invoiceOrder.customerName }}</div>
                  <div class="text-muted small">{{ invoiceOrder.customerEmail || 'No email provided' }}</div>
                  <div class="text-muted small">{{ invoiceOrder.customerPhone || 'Walk-in Retail' }}</div>
                </div>
                <div class="col-6 text-end">
                  <div class="text-uppercase text-muted fw-bold small mb-1">Order Summary</div>
                  <div>Status: <span class="badge bg-primary-subtle text-primary">{{ invoiceOrder.status }}</span></div>
                  <div>Payment: <span class="badge bg-success-subtle text-success">{{ invoiceOrder.paymentStatus }} ({{ invoiceOrder.paymentMethod }})</span></div>
                  <div class="text-muted small mt-1">Dispatched From: {{ invoiceOrder.warehouseName }}</div>
                </div>
              </div>

              <!-- Line Items Table -->
              <div class="table-responsive mb-4">
                <table class="table table-bordered align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>Item Description</th>
                      <th>SKU</th>
                      <th class="text-center">Qty</th>
                      <th class="text-end">Unit Price</th>
                      <th class="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of invoiceOrder.items; let i = index">
                      <td>{{ i + 1 }}</td>
                      <td class="fw-semibold">{{ item.productName }}</td>
                      <td><code>{{ item.productSku }}</code></td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-end">\${{ item.unitPrice | number:'1.2-2' }}</td>
                      <td class="text-end fw-bold">\${{ item.totalPrice | number:'1.2-2' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4" class="border-0"></td>
                      <td class="text-end text-muted">Subtotal:</td>
                      <td class="text-end fw-semibold">\${{ invoiceOrder.subtotal | number:'1.2-2' }}</td>
                    </tr>
                    <tr>
                      <td colspan="4" class="border-0"></td>
                      <td class="text-end text-muted">Retail Tax (5%):</td>
                      <td class="text-end fw-semibold">\${{ invoiceOrder.tax | number:'1.2-2' }}</td>
                    </tr>
                    <tr *ngIf="invoiceOrder.discount">
                      <td colspan="4" class="border-0"></td>
                      <td class="text-end text-muted">Discount:</td>
                      <td class="text-end text-danger fw-semibold">-\${{ invoiceOrder.discount | number:'1.2-2' }}</td>
                    </tr>
                    <tr class="table-light">
                      <td colspan="4" class="border-0"></td>
                      <td class="text-end fw-bold fs-6">Grand Total:</td>
                      <td class="text-end fw-bold fs-6 text-primary">\${{ invoiceOrder.totalAmount | number:'1.2-2' }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div class="text-center text-muted small border-top pt-3">
                Thank you for your business with XYZ Retail Corporation! For returns or warranty, present this invoice.
              </div>
            </div>
            <div class="modal-footer border-top bg-light d-print-none">
              <button type="button" class="btn btn-sm btn-secondary" (click)="invoiceOrder = null">Close</button>
              <button type="button" class="btn btn-sm rims-btn-primary" (click)="printInvoice()">
                <i class="bi bi-printer me-1"></i> Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- New Order Modal -->
      <div class="modal fade show d-block" *ngIf="showCreateModal" style="background: rgba(15, 23, 42, 0.6);" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 12px;">
            <div class="modal-header border-bottom">
              <h5 class="modal-title fw-bold text-dark">Create Sales Order / POS Transaction</h5>
              <button type="button" class="btn-close" (click)="showCreateModal = false"></button>
            </div>
            <form (ngSubmit)="submitSalesOrder()">
              <div class="modal-body p-4">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Customer Name *</label>
                    <input type="text" class="form-control" [(ngModel)]="newOrder.customerName" name="custName" required placeholder="e.g. David Henderson">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Customer Phone</label>
                    <input type="text" class="form-control" [(ngModel)]="newOrder.customerPhone" name="custPhone" placeholder="+1-555-...">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Fulfillment Store / Warehouse *</label>
                    <select class="form-select" [(ngModel)]="newOrder.warehouseId" name="wh" required>
                      <option *ngFor="let w of warehouses" [value]="w.id">{{ w.name }} ({{ w.code }})</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small">Payment Method *</label>
                    <select class="form-select" [(ngModel)]="newOrder.paymentMethod" name="payMethod" required>
                      <option value="CASH">Cash at Register</option>
                      <option value="CARD">Credit / Debit Card</option>
                      <option value="UPI">UPI / Digital Wallet</option>
                      <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                    </select>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mt-4 mb-2">
                  <h6 class="fw-bold text-dark mb-0">Order Line Items</h6>
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
                        <th style="width: 140px;">Price ($)</th>
                        <th style="width: 120px;">Subtotal</th>
                        <th style="width: 40px;"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of newOrder.items; let i = index">
                        <td>
                          <select class="form-select form-select-sm" [(ngModel)]="item.productId" [name]="'itemProd_' + i" (change)="onProductChange(item)">
                            <option *ngFor="let p of products" [value]="p.id">{{ p.name }} (Avail: {{ p.currentStock }})</option>
                          </select>
                        </td>
                        <td>
                          <input type="number" min="1" class="form-control form-control-sm" [(ngModel)]="item.quantity" [name]="'itemQty_' + i">
                        </td>
                        <td>
                          <input type="number" step="0.01" min="0" class="form-control form-control-sm" [(ngModel)]="item.unitPrice" [name]="'itemPrice_' + i">
                        </td>
                        <td class="fw-bold small">
                          \${{ (item.quantity * item.unitPrice) | number:'1.2-2' }}
                        </td>
                        <td>
                          <button type="button" class="btn btn-sm text-danger p-0" (click)="removeLineItem(i)" [disabled]="newOrder.items.length === 1">
                            <i class="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" class="text-end fw-bold">Estimated Total:</td>
                        <td colspan="2" class="fw-bold text-primary fs-6">\${{ calculateTotal() | number:'1.2-2' }}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div class="modal-footer border-top bg-light">
                <button type="button" class="btn btn-sm btn-secondary" (click)="showCreateModal = false">Cancel</button>
                <button type="submit" class="btn btn-sm rims-btn-primary" [disabled]="submitting">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1"></span>
                  Confirm & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SalesOrdersComponent implements OnInit {
  orders: CustomerOrder[] = [];
  warehouses: Warehouse[] = [];
  products: Product[] = [];

  invoiceOrder: CustomerOrder | null = null;
  showCreateModal = false;
  submitting = false;

  newOrder: CustomerOrder = {
    customerName: 'David Henderson',
    customerPhone: '+1-555-892-1200',
    warehouseId: 1,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    items: []
  };

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.loadWarehouses();
    this.loadProducts();
  }

  loadOrders(): void {
    this.apiService.getCustomerOrders().subscribe({
      next: (res) => { if (res.success) this.orders = res.data; }
    });
  }

  loadWarehouses(): void {
    this.apiService.getWarehouses().subscribe({
      next: (res) => {
        if (res.success) {
          this.warehouses = res.data;
          if (this.warehouses.length > 0) this.newOrder.warehouseId = this.warehouses[0].id!;
        }
      }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (res) => { if (res.success) this.products = res.data; }
    });
  }

  viewInvoice(order: CustomerOrder): void {
    this.invoiceOrder = order;
  }

  printInvoice(): void {
    window.print();
  }

  openCreateModal(): void {
    this.newOrder = {
      customerName: 'Walk-in Customer',
      customerPhone: '',
      warehouseId: this.warehouses[0]?.id || 1,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      items: [{
        productId: this.products[0]?.id || 1,
        quantity: 1,
        unitPrice: this.products[0]?.sellingPrice || 25
      }]
    };
    this.showCreateModal = true;
  }

  addLineItem(): void {
    if (this.products.length === 0) return;
    this.newOrder.items.push({
      productId: this.products[0].id!,
      quantity: 1,
      unitPrice: this.products[0].sellingPrice || 25
    });
  }

  removeLineItem(idx: number): void {
    if (this.newOrder.items.length > 1) {
      this.newOrder.items.splice(idx, 1);
    }
  }

  onProductChange(item: CustomerOrderItem): void {
    const prod = this.products.find(p => p.id === Number(item.productId));
    if (prod) {
      item.unitPrice = prod.sellingPrice;
    }
  }

  calculateTotal(): number {
    const subtotal = this.newOrder.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.05;
    return subtotal + tax;
  }

  submitSalesOrder(): void {
    this.submitting = true;
    this.apiService.createCustomerOrder(this.newOrder).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.success) {
          this.toastService.success(`Order ${res.data.orderNumber} fulfilled and stock deducted`);
          this.showCreateModal = false;
          this.loadOrders();
          this.viewInvoice(res.data);
        }
      },
      error: () => this.submitting = false
    });
  }

  cancelOrder(order: CustomerOrder): void {
    if (confirm(`Cancel sales order ${order.orderNumber}? Stock will be automatically restored to warehouse.`)) {
      this.apiService.updateOrderStatus(order.id!, 'CANCELLED').subscribe({
        next: (res) => {
          if (res.success) {
            this.toastService.warning(`Order ${order.orderNumber} cancelled and stock safely restored.`);
            this.loadOrders();
          }
        }
      });
    }
  }
}
