import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './shared/layout.component';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductsComponent } from './features/products/products.component';
import { CategoriesComponent } from './features/categories/categories.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { WarehousesComponent } from './features/warehouses/warehouses.component';
import { SuppliersComponent } from './features/suppliers/suppliers.component';
import { PurchaseOrdersComponent } from './features/purchase-orders/purchase-orders.component';
import { SalesOrdersComponent } from './features/sales-orders/sales-orders.component';
import { SmartReorderComponent } from './features/smart-reorder/smart-reorder.component';
import { BarcodeScannerComponent } from './features/barcode/barcode-scanner.component';
import { ReportsComponent } from './features/reports/reports.component';
import { AuditTrailComponent } from './features/audit/audit-trail.component';
import { CustomersComponent } from './features/customers/customers.component';
import { UsersComponent } from './features/users/users.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'warehouses', component: WarehousesComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'purchase-orders', component: PurchaseOrdersComponent },
      { path: 'orders', component: SalesOrdersComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'smart-reorder', component: SmartReorderComponent },
      { path: 'barcode', component: BarcodeScannerComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'audit', component: AuditTrailComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
