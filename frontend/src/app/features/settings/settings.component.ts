import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-3">
      <!-- Page Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="fw-bold mb-1 text-navy">System Settings & Configuration</h4>
          <p class="text-muted mb-0 small">Customize corporate branding, accounting parameters, tax rates, and replenishment triggers</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2" (click)="saveSettings()" [disabled]="saving">
          <span *ngIf="saving" class="spinner-border spinner-border-sm"></span>
          <i *ngIf="!saving" class="bi bi-floppy-fill"></i>
          <span>Save Changes</span>
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <div class="text-muted small mt-2">Loading system preferences...</div>
      </div>

      <div *ngIf="!loading" class="row g-4">
        <!-- Company Profile -->
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-bottom">
              <h6 class="fw-bold mb-0 text-navy d-flex align-items-center gap-2">
                <i class="bi bi-building-gear text-primary"></i>
                <span>Enterprise Business Profile</span>
              </h6>
            </div>
            <div class="card-body p-4">
              <div class="mb-3">
                <label class="form-label fw-semibold small">Registered Organization Name</label>
                <input type="text" class="form-control" [(ngModel)]="settings['company_name']" placeholder="XYZ Retail Corporation">
                <div class="form-text">Displayed on printed invoices, purchase orders, and PDF receipts.</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small">Corporate Operations Email</label>
                <input type="email" class="form-control" [(ngModel)]="settings['company_email']" placeholder="operations@xyzretail.com">
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small">Customer Support Hotline</label>
                <input type="text" class="form-control" [(ngModel)]="settings['company_phone']" placeholder="+1-800-555-0199">
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small">Headquarters Address</label>
                <textarea class="form-control" rows="2" [(ngModel)]="settings['company_address']" placeholder="104 Logistics Parkway, Sector 18, Metro City"></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial & POS Preferences -->
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-header bg-white py-3 border-bottom">
              <h6 class="fw-bold mb-0 text-navy d-flex align-items-center gap-2">
                <i class="bi bi-cash-stack text-success"></i>
                <span>Accounting & POS Tax Setup</span>
              </h6>
            </div>
            <div class="card-body p-4">
              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Base Currency Code</label>
                  <select class="form-select" [(ngModel)]="settings['currency_code']">
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="CAD">CAD ($ - Canadian Dollar)</option>
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="AUD">AUD ($ - Australian Dollar)</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Currency Symbol</label>
                  <input type="text" class="form-control" [(ngModel)]="settings['currency_symbol']" placeholder="$">
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small">Standard Sales Tax Rate (%)</label>
                <div class="input-group">
                  <input type="number" step="0.01" class="form-control" [(ngModel)]="settings['default_tax_rate']" placeholder="8.25">
                  <span class="input-group-text">%</span>
                </div>
                <div class="form-text">Applied automatically to retail customer checkout orders.</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold small">Sales Invoice Prefix</label>
                <input type="text" class="form-control" [(ngModel)]="settings['invoice_prefix']" placeholder="INV-XYZ-">
                <div class="form-text">Prefix used when generating unique sequential order invoices.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Inventory Intelligence & Automation -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white py-3 border-bottom">
              <h6 class="fw-bold mb-0 text-navy d-flex align-items-center gap-2">
                <i class="bi bi-cpu text-info"></i>
                <span>Inventory Thresholds & Replenishment Rules</span>
              </h6>
            </div>
            <div class="card-body p-4">
              <div class="row g-4 align-items-center">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Global Safety Stock Alert Threshold</label>
                  <div class="input-group">
                    <input type="number" class="form-control" [(ngModel)]="settings['low_stock_threshold']" placeholder="10">
                    <span class="input-group-text">units</span>
                  </div>
                  <div class="form-text">Triggers dashboard low-stock badges when product inventory drops below this quantity.</div>
                </div>

                <div class="col-md-6">
                  <div class="card bg-light border p-3">
                    <div class="form-check form-switch mb-1">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        id="autoReorderToggle" 
                        [checked]="settings['auto_reorder_enabled'] === 'true'"
                        (change)="toggleAutoReorder($event)">
                      <label class="form-check-label fw-bold text-dark" for="autoReorderToggle">
                        Automated Smart Reorder Suggestions
                      </label>
                    </div>
                    <div class="small text-muted ps-4">
                      When enabled, the system continuously analyzes turnover velocities and generates recommended Purchase Orders.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-navy { color: #1a237e; }
    .bg-navy { background-color: #1a237e; }
  `]
})
export class SettingsComponent implements OnInit {
  settings: { [key: string]: string } = {};
  loading = false;
  saving = false;

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading = true;
    this.api.getSettings().subscribe({
      next: (res) => {
        this.settings = res.data || {
          company_name: 'XYZ Retail Corporation',
          company_email: 'operations@xyzretail.com',
          company_phone: '+1-800-555-0199',
          company_address: '104 Logistics Parkway, Sector 18, Metro City',
          currency_code: 'USD',
          currency_symbol: '$',
          default_tax_rate: '8.25',
          invoice_prefix: 'INV-XYZ-',
          low_stock_threshold: '10',
          auto_reorder_enabled: 'true'
        };
        this.loading = false;
      },
      error: () => {
        // Fallback default demonstration properties
        this.settings = {
          company_name: 'XYZ Retail Corporation',
          company_email: 'operations@xyzretail.com',
          company_phone: '+1-800-555-0199',
          company_address: '104 Logistics Parkway, Sector 18, Metro City',
          currency_code: 'USD',
          currency_symbol: '$',
          default_tax_rate: '8.25',
          invoice_prefix: 'INV-XYZ-',
          low_stock_threshold: '10',
          auto_reorder_enabled: 'true'
        };
        this.loading = false;
      }
    });
  }

  toggleAutoReorder(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.settings['auto_reorder_enabled'] = isChecked ? 'true' : 'false';
  }

  saveSettings(): void {
    this.saving = true;
    this.api.updateSettings(this.settings).subscribe({
      next: () => {
        this.toast.success('System settings saved and applied successfully');
        this.saving = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to update settings');
        this.saving = false;
      }
    });
  }
}
