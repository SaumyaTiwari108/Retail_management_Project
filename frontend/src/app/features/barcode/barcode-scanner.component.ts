import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/models';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Barcode & RFID Hardware Interface</h4>
          <p class="text-muted mb-0 small">Compatible with USB / Bluetooth barcode scanners, handheld terminals & simulated RFID antennas</p>
        </div>
      </div>

      <div class="row g-4">
        <!-- Scanner Input Panel -->
        <div class="col-12 col-lg-6">
          <div class="rims-card p-4 h-100">
            <div class="d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-upc-scan fs-4 text-primary"></i>
              <h5 class="fw-bold text-dark mb-0">Direct Scanner Terminal</h5>
            </div>
            <p class="text-muted small">
              Focus in the box below and scan any retail product barcode or SKU with physical laser hardware, or simulate entry.
            </p>

            <div class="mb-4">
              <div class="input-group input-group-lg">
                <span class="input-group-text bg-white"><i class="bi bi-upc text-primary"></i></span>
                <input #scanInput
                       type="text"
                       class="form-control font-monospace fw-bold"
                       [(ngModel)]="scannedCode"
                       (keyup.enter)="lookupCode()"
                       placeholder="Scan barcode or press Enter..."
                       autofocus>
                <button class="btn rims-btn-primary px-4" (click)="lookupCode()" [disabled]="searching || !scannedCode">
                  <span *ngIf="searching" class="spinner-border spinner-border-sm me-1"></span>
                  Lookup
                </button>
              </div>
            </div>

            <!-- Quick Demo Barcode Buttons -->
            <div class="mb-4">
              <label class="form-label small text-muted fw-semibold mb-2">Pre-configured Demo Barcodes:</label>
              <div class="d-flex gap-2 flex-wrap">
                <button type="button" class="btn btn-sm btn-outline-secondary font-monospace" (click)="scanPreset('890100100001')">
                  890100100001 (Headphones)
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary font-monospace" (click)="scanPreset('890100100002')">
                  890100100002 (4K Monitor)
                </button>
                <button type="button" class="btn btn-sm btn-outline-secondary font-monospace" (click)="scanPreset('890100100004')">
                  890100100004 (Espresso)
                </button>
              </div>
            </div>

            <!-- Scanned Product Card Preview -->
            <div *ngIf="foundProduct" class="border rounded p-3 bg-light">
              <div class="d-flex align-items-start gap-3">
                <img [src]="foundProduct.imageUrl || 'https://placehold.co/60x60'" class="rounded border" style="width: 60px; height: 60px; object-fit: cover;">
                <div class="flex-grow-1">
                  <div class="d-flex justify-content-between align-items-start">
                    <h6 class="fw-bold text-dark mb-0">{{ foundProduct.name }}</h6>
                    <span class="badge" [ngClass]="foundProduct.currentStock > foundProduct.reorderLevel ? 'badge-soft-success' : 'badge-soft-warning'">
                      {{ foundProduct.currentStock }} in stock
                    </span>
                  </div>
                  <div class="text-muted small mt-1">SKU: <code>{{ foundProduct.sku }}</code> &bull; Barcode: <code>{{ foundProduct.barcode }}</code></div>
                  <div class="fw-semibold text-primary mt-1">\${{ foundProduct.sellingPrice | number:'1.2-2' }}</div>

                  <!-- Quick Stock Adjust Controls -->
                  <div class="mt-3 pt-2 border-top d-flex gap-2">
                    <button class="btn btn-sm btn-success d-flex align-items-center gap-1" (click)="quickStockChange(foundProduct, 'RECEIVING', 1)">
                      <i class="bi bi-plus-circle"></i> Quick Stock In (+1)
                    </button>
                    <button class="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            (click)="quickStockChange(foundProduct, 'SALE', 1)"
                            [disabled]="foundProduct.currentStock <= 0">
                      <i class="bi bi-dash-circle"></i> Quick Stock Out (-1)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Simulated RFID Batch Scanner Panel -->
        <div class="col-12 col-lg-6">
          <div class="rims-card p-4 h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-broadcast-pin fs-4 text-info"></i>
                <h5 class="fw-bold text-dark mb-0">Simulated RFID Portal Gate</h5>
              </div>
              <span class="badge bg-info-subtle text-info border">Virtual Demo Mode</span>
            </div>
            <p class="text-muted small">
              High-frequency multi-tag bulk reader simulation. Emulates bulk RFID pallets passing through warehouse receiving dock doors.
            </p>

            <div class="p-3 bg-light rounded text-center my-3">
              <div class="d-flex justify-content-center align-items-center gap-2 mb-2">
                <span class="spinner-grow spinner-grow-sm text-info" *ngIf="simulatingRfid"></span>
                <span class="fw-bold text-dark">{{ simulatingRfid ? 'Reading RFID Tags in range...' : 'Antenna Array Ready' }}</span>
              </div>
              <button class="btn btn-sm rims-btn-primary" (click)="simulateRfidScan()" [disabled]="simulatingRfid">
                <i class="bi bi-broadcast me-1"></i> Trigger Batch RFID Scan
              </button>
            </div>

            <!-- Scanned Tag Batch List -->
            <div *ngIf="rfidTags.length > 0">
              <h6 class="fw-bold text-dark small text-uppercase mb-2">Detected RFID EPC Transponders ({{ rfidTags.length }})</h6>
              <ul class="list-group list-group-flush border rounded">
                <li class="list-group-item d-flex justify-content-between align-items-center py-2" *ngFor="let t of rfidTags">
                  <div>
                    <div class="font-monospace small fw-semibold text-primary"><i class="bi bi-tag me-1"></i>{{ t.epc }}</div>
                    <small class="text-muted">{{ t.productName }}</small>
                  </div>
                  <span class="badge bg-success-subtle text-success">Verified Signal: -42 dBm</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BarcodeScannerComponent implements OnInit, AfterViewInit {
  @ViewChild('scanInput') scanInputRef!: ElementRef<HTMLInputElement>;

  scannedCode = '';
  searching = false;
  foundProduct: Product | null = null;

  simulatingRfid = false;
  rfidTags: { epc: string; productName: string }[] = [];

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.scanInputRef) {
      this.scanInputRef.nativeElement.focus();
    }
  }

  scanPreset(code: string): void {
    this.scannedCode = code;
    this.lookupCode();
  }

  lookupCode(): void {
    if (!this.scannedCode.trim()) return;
    this.searching = true;
    const code = this.scannedCode.trim();

    // First try by barcode
    this.apiService.getProductByBarcode(code).subscribe({
      next: (res) => {
        this.searching = false;
        if (res.success && res.data) {
          this.foundProduct = res.data;
          this.toastService.success(`Scanned: ${res.data.name}`);
        }
      },
      error: () => {
        // Fallback to SKU lookup
        this.apiService.getProductBySku(code).subscribe({
          next: (res) => {
            this.searching = false;
            if (res.success && res.data) {
              this.foundProduct = res.data;
              this.toastService.success(`Scanned: ${res.data.name}`);
            }
          },
          error: () => {
            this.searching = false;
            this.foundProduct = null;
            this.toastService.error(`No product found matching code: ${code}`);
          }
        });
      }
    });
  }

  quickStockChange(product: Product, type: string, qty: number): void {
    this.apiService.recordStockMovement({
      productId: product.id!,
      movementType: type,
      quantity: qty,
      referenceNumber: 'SCAN-QUICK-' + SystemTime(),
      remarks: `Quick terminal barcode scan (${type})`
    }).subscribe({
      next: (res) => {
        if (res.success) {
          product.currentStock = res.data.newStock;
          this.toastService.success(`Updated stock for ${product.name}: ${res.data.newStock} units`);
        }
      }
    });
  }

  simulateRfidScan(): void {
    this.simulatingRfid = true;
    this.rfidTags = [];

    setTimeout(() => {
      this.simulatingRfid = false;
      this.rfidTags = [
        { epc: 'EPC-96-300833B2DDD9014000000001', productName: 'AeroPulse Wireless Noise-Cancelling Headphones' },
        { epc: 'EPC-96-300833B2DDD9014000000002', productName: 'UltraSlim 4K UHD Smart Monitor 27-inch' },
        { epc: 'EPC-96-300833B2DDD9014000000004', productName: 'Precision Barista Espresso Machine 15-Bar' }
      ];
      this.toastService.info('RFID Portal: 3 transponders recognized in dock zone 4');
    }, 1200);
  }
}

function SystemTime(): number {
  return Date.now();
}
