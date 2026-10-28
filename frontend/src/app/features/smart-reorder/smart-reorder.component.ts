import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ReorderRecommendation } from '../../core/models/models';

@Component({
  selector: 'app-smart-reorder',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <div class="d-flex align-items-center gap-2 mb-1">
            <h4 class="fw-bold text-dark mb-0">Smart Inventory & Reorder Intelligence</h4>
            <span class="badge bg-warning text-dark px-2 py-1"><i class="bi bi-cpu-fill me-1"></i>Rule-Based Assistant</span>
          </div>
          <p class="text-muted mb-0 small">Transparent algorithmic analysis calculating replenishment quantities, stockout hazards, and excess buffers</p>
        </div>
      </div>

      <!-- Logic Explanation Card -->
      <div class="rims-card p-3 mb-4 bg-light border-0">
        <div class="d-flex gap-3 align-items-center">
          <div class="bg-primary text-white rounded p-3 d-flex align-items-center justify-content-center">
            <i class="bi bi-info-circle fs-4"></i>
          </div>
          <div class="small text-muted">
            <strong class="text-dark">How recommendations are computed:</strong>
            Our deterministic replenishment engine monitors active inventory against configured safety thresholds.
            Products at <strong>0 units</strong> are marked <span class="badge badge-soft-danger">CRITICAL</span>;
            below <strong>50% buffer</strong> are marked <span class="badge badge-soft-warning">HIGH</span>;
            and items holding <strong>&gt;4x buffer</strong> are flagged for <span class="badge badge-soft-info">EXCESS</span> inventory holding.
          </div>
        </div>
      </div>

      <!-- Recommendation Cards List -->
      <div class="row g-3">
        <div class="col-12 col-lg-6" *ngFor="let r of recommendations">
          <div class="rims-card p-4 h-100 d-flex flex-column justify-content-between" [ngClass]="{
            'border-danger border-2': r.urgency === 'CRITICAL',
            'border-warning': r.urgency === 'HIGH'
          }">
            <div>
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <span class="badge mb-2" [ngClass]="{
                    'bg-danger text-white': r.urgency === 'CRITICAL',
                    'bg-warning text-dark': r.urgency === 'HIGH',
                    'bg-info text-dark': r.urgency === 'MODERATE',
                    'bg-secondary text-white': r.urgency === 'EXCESS'
                  }">
                    {{ r.urgency }} PRIORITY
                  </span>
                  <h5 class="fw-bold text-dark mb-1">{{ r.productName }}</h5>
                  <div class="text-muted small">Category: {{ r.categoryName }} &bull; SKU: <code>{{ r.sku }}</code></div>
                </div>
              </div>

              <!-- Metrics Row -->
              <div class="row g-2 p-3 my-2 bg-light rounded text-center">
                <div class="col-4">
                  <div class="text-muted small">Current Stock</div>
                  <div class="fw-bold fs-6" [ngClass]="r.currentStock === 0 ? 'text-danger' : 'text-dark'">{{ r.currentStock }} units</div>
                </div>
                <div class="col-4 border-start border-end">
                  <div class="text-muted small">Reorder Threshold</div>
                  <div class="fw-bold fs-6">{{ r.reorderLevel }} units</div>
                </div>
                <div class="col-4">
                  <div class="text-muted small">Recommended Order</div>
                  <div class="fw-bold fs-6 text-primary">+{{ r.recommendedOrderQuantity }} units</div>
                </div>
              </div>

              <!-- Recommendation Reason -->
              <div class="p-2 mb-3 rounded" style="background: #f8fafc; border-left: 3px solid #2563eb;">
                <div class="text-muted small">
                  <strong>Reasoning:</strong> {{ r.reason }}
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center pt-3 border-top">
              <span class="text-muted small">Estimated Replenishment Cost: <strong class="text-dark">\${{ r.estimatedCost | number:'1.2-2' }}</strong></span>
              <a *ngIf="r.recommendedOrderQuantity > 0" routerLink="/purchase-orders" class="btn btn-sm rims-btn-primary">
                <i class="bi bi-cart-plus me-1"></i> Order Now
              </a>
            </div>
          </div>
        </div>

        <div class="col-12 text-center py-5 text-muted" *ngIf="recommendations.length === 0 && !loading">
          <i class="bi bi-shield-check fs-1 text-success"></i>
          <h5 class="fw-bold text-dark mt-2">Optimal Stock Health</h5>
          <p class="small">All retail catalog items meet adequate inventory buffers. No replenishment required.</p>
        </div>
      </div>
    </div>
  `
})
export class SmartReorderComponent implements OnInit {
  recommendations: ReorderRecommendation[] = [];
  loading = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.loading = true;
    this.apiService.getReorderRecommendations().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) this.recommendations = res.data;
      },
      error: () => this.loading = false
    });
  }
}
