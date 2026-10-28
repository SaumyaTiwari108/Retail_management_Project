import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuditLog } from '../../core/models/models';

@Component({
  selector: 'app-audit-trail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Header -->
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">System Security & Audit Trail</h4>
          <p class="text-muted mb-0 small">Immutable operational records of product edits, stock movements, PO receipts and user logins</p>
        </div>
        <button class="btn btn-sm btn-outline-secondary" (click)="loadLogs()">
          <i class="bi bi-arrow-clockwise me-1"></i> Refresh Logs
        </button>
      </div>

      <!-- Audit Logs Table -->
      <div class="rims-card overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Target Entity</th>
                <th>Action</th>
                <th>Operator</th>
                <th>Audit Details</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let log of logs">
                <td class="text-muted small text-nowrap">{{ log.timestamp | date:'medium' }}</td>
                <td>
                  <span class="badge bg-light text-dark border font-monospace">
                    {{ log.entityName }} #{{ log.entityId }}
                  </span>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-soft-success': log.action === 'CREATE' || log.action === 'RECEIVE',
                    'badge-soft-info': log.action === 'UPDATE' || log.action === 'STATUS_CHANGE',
                    'badge-soft-warning': log.action === 'TRANSFER' || log.action === 'DEACTIVATE',
                    'badge-soft-secondary': log.action === 'LOGIN'
                  }">
                    {{ log.action }}
                  </span>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-1">
                    <i class="bi bi-person-circle text-muted"></i>
                    <span class="fw-semibold text-dark">{{ log.performedBy }}</span>
                  </div>
                </td>
                <td class="small text-muted">{{ log.details }}</td>
              </tr>
              <tr *ngIf="logs.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">No audit records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AuditTrailComponent implements OnInit {
  logs: AuditLog[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.apiService.getAuditLogs().subscribe({
      next: (res) => { if (res.success) this.logs = res.data; }
    });
  }
}
