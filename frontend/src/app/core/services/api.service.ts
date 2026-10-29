import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  Category,
  Product,
  Warehouse,
  StockBalance,
  StockMovement,
  Supplier,
  PurchaseOrder,
  Customer,
  CustomerOrder,
  DashboardStats,
  ReorderRecommendation,
  AuditLog,
  AppUser,
  AppSetting
} from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Dashboard & Analytics
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/analytics/dashboard`);
  }

  getReorderRecommendations(): Observable<ApiResponse<ReorderRecommendation[]>> {
    return this.http.get<ApiResponse<ReorderRecommendation[]>>(`${this.baseUrl}/analytics/recommendations`);
  }

  exportInventoryCsv(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/analytics/export-inventory`, { responseType: 'blob' });
  }

  // Categories
  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${this.baseUrl}/categories`);
  }

  createCategory(category: Category): Observable<ApiResponse<Category>> {
    return this.http.post<ApiResponse<Category>>(`${this.baseUrl}/categories`, category);
  }

  updateCategory(id: number, category: Category): Observable<ApiResponse<Category>> {
    return this.http.put<ApiResponse<Category>>(`${this.baseUrl}/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/categories/${id}`);
  }

  // Products
  getProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/products`);
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/products/${id}`);
  }

  getProductByBarcode(barcode: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/products/barcode/${barcode}`);
  }

  getProductBySku(sku: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/products/sku/${sku}`);
  }

  searchProducts(query: string): Observable<ApiResponse<Product[]>> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/products/search`, { params });
  }

  getLowStockProducts(): Observable<ApiResponse<Product[]>> {
    return this.http.get<ApiResponse<Product[]>>(`${this.baseUrl}/products/low-stock`);
  }

  createProduct(product: Product): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(`${this.baseUrl}/products`, product);
  }

  updateProduct(id: number, product: Product): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/products/${id}`);
  }

  // Warehouses
  getWarehouses(): Observable<ApiResponse<Warehouse[]>> {
    return this.http.get<ApiResponse<Warehouse[]>>(`${this.baseUrl}/warehouses`);
  }

  createWarehouse(warehouse: Warehouse): Observable<ApiResponse<Warehouse>> {
    return this.http.post<ApiResponse<Warehouse>>(`${this.baseUrl}/warehouses`, warehouse);
  }

  updateWarehouse(id: number, warehouse: Warehouse): Observable<ApiResponse<Warehouse>> {
    return this.http.put<ApiResponse<Warehouse>>(`${this.baseUrl}/warehouses/${id}`, warehouse);
  }

  // Inventory & Movements
  recordStockMovement(movement: {
    productId: number;
    warehouseId?: number;
    movementType: string;
    quantity: number;
    referenceNumber?: string;
    remarks?: string;
  }): Observable<ApiResponse<StockMovement>> {
    return this.http.post<ApiResponse<StockMovement>>(`${this.baseUrl}/inventory/movement`, movement);
  }

  transferStock(transfer: {
    productId: number;
    sourceWarehouseId: number;
    destinationWarehouseId: number;
    quantity: number;
    remarks?: string;
  }): Observable<ApiResponse<StockMovement>> {
    return this.http.post<ApiResponse<StockMovement>>(`${this.baseUrl}/inventory/transfer`, transfer);
  }

  getWarehouseBalances(warehouseId: number): Observable<ApiResponse<StockBalance[]>> {
    return this.http.get<ApiResponse<StockBalance[]>>(`${this.baseUrl}/inventory/warehouse/${warehouseId}/balances`);
  }

  getProductBalances(productId: number): Observable<ApiResponse<StockBalance[]>> {
    return this.http.get<ApiResponse<StockBalance[]>>(`${this.baseUrl}/inventory/product/${productId}/balances`);
  }

  getProductMovements(productId: number): Observable<ApiResponse<StockMovement[]>> {
    return this.http.get<ApiResponse<StockMovement[]>>(`${this.baseUrl}/inventory/product/${productId}/movements`);
  }

  getRecentMovements(): Observable<ApiResponse<StockMovement[]>> {
    return this.http.get<ApiResponse<StockMovement[]>>(`${this.baseUrl}/inventory/movements/recent`);
  }

  // Suppliers
  getSuppliers(): Observable<ApiResponse<Supplier[]>> {
    return this.http.get<ApiResponse<Supplier[]>>(`${this.baseUrl}/suppliers`);
  }

  createSupplier(supplier: Supplier): Observable<ApiResponse<Supplier>> {
    return this.http.post<ApiResponse<Supplier>>(`${this.baseUrl}/suppliers`, supplier);
  }

  updateSupplier(id: number, supplier: Supplier): Observable<ApiResponse<Supplier>> {
    return this.http.put<ApiResponse<Supplier>>(`${this.baseUrl}/suppliers/${id}`, supplier);
  }

  // Purchase Orders
  getPurchaseOrders(): Observable<ApiResponse<PurchaseOrder[]>> {
    return this.http.get<ApiResponse<PurchaseOrder[]>>(`${this.baseUrl}/purchase-orders`);
  }

  getPurchaseOrderById(id: number): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.get<ApiResponse<PurchaseOrder>>(`${this.baseUrl}/purchase-orders/${id}`);
  }

  createPurchaseOrder(po: PurchaseOrder): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.baseUrl}/purchase-orders`, po);
  }

  updatePurchaseOrderStatus(id: number, status: string): Observable<ApiResponse<PurchaseOrder>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<PurchaseOrder>>(`${this.baseUrl}/purchase-orders/${id}/status`, null, { params });
  }

  receivePurchaseOrder(id: number): Observable<ApiResponse<PurchaseOrder>> {
    return this.http.post<ApiResponse<PurchaseOrder>>(`${this.baseUrl}/purchase-orders/${id}/receive`, null);
  }

  // Customer Orders (Sales)
  getCustomerOrders(): Observable<ApiResponse<CustomerOrder[]>> {
    return this.http.get<ApiResponse<CustomerOrder[]>>(`${this.baseUrl}/orders`);
  }

  getCustomerOrderById(id: number): Observable<ApiResponse<CustomerOrder>> {
    return this.http.get<ApiResponse<CustomerOrder>>(`${this.baseUrl}/orders/${id}`);
  }

  createCustomerOrder(order: CustomerOrder): Observable<ApiResponse<CustomerOrder>> {
    return this.http.post<ApiResponse<CustomerOrder>>(`${this.baseUrl}/orders`, order);
  }

  updateOrderStatus(id: number, status: string): Observable<ApiResponse<CustomerOrder>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<CustomerOrder>>(`${this.baseUrl}/orders/${id}/status`, null, { params });
  }

  updateOrderPaymentStatus(id: number, status: string): Observable<ApiResponse<CustomerOrder>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<ApiResponse<CustomerOrder>>(`${this.baseUrl}/orders/${id}/payment-status`, null, { params });
  }

  // Audit Logs
  getAuditLogs(): Observable<ApiResponse<AuditLog[]>> {
    return this.http.get<ApiResponse<AuditLog[]>>(`${this.baseUrl}/audit/logs`);
  }

  // Customers
  getCustomers(search?: string): Observable<ApiResponse<Customer[]>> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get<ApiResponse<Customer[]>>(`${this.baseUrl}/customers`, { params });
  }

  getCustomerById(id: number): Observable<ApiResponse<Customer>> {
    return this.http.get<ApiResponse<Customer>>(`${this.baseUrl}/customers/${id}`);
  }

  createCustomer(customer: Customer): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(`${this.baseUrl}/customers`, customer);
  }

  updateCustomer(id: number, customer: Customer): Observable<ApiResponse<Customer>> {
    return this.http.put<ApiResponse<Customer>>(`${this.baseUrl}/customers/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/customers/${id}`);
  }

  // Users (Admin)
  getUsers(): Observable<ApiResponse<AppUser[]>> {
    return this.http.get<ApiResponse<AppUser[]>>(`${this.baseUrl}/users`);
  }

  getUserById(id: number): Observable<ApiResponse<AppUser>> {
    return this.http.get<ApiResponse<AppUser>>(`${this.baseUrl}/users/${id}`);
  }

  createUser(user: AppUser): Observable<ApiResponse<AppUser>> {
    return this.http.post<ApiResponse<AppUser>>(`${this.baseUrl}/users`, user);
  }

  updateUser(id: number, user: AppUser): Observable<ApiResponse<AppUser>> {
    return this.http.put<ApiResponse<AppUser>>(`${this.baseUrl}/users/${id}`, user);
  }

  toggleUserStatus(id: number): Observable<ApiResponse<AppUser>> {
    return this.http.put<ApiResponse<AppUser>>(`${this.baseUrl}/users/${id}/toggle-status`, {});
  }

  changeUserRole(id: number, role: string): Observable<ApiResponse<AppUser>> {
    return this.http.put<ApiResponse<AppUser>>(`${this.baseUrl}/users/${id}/role`, { role });
  }

  // Settings
  getSettings(): Observable<ApiResponse<{ [key: string]: string }>> {
    return this.http.get<ApiResponse<{ [key: string]: string }>>(`${this.baseUrl}/settings`);
  }

  getSettingsList(): Observable<ApiResponse<AppSetting[]>> {
    return this.http.get<ApiResponse<AppSetting[]>>(`${this.baseUrl}/settings/list`);
  }

  updateSettings(settings: { [key: string]: string }): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.baseUrl}/settings`, settings);
  }

  saveSetting(setting: AppSetting): Observable<ApiResponse<AppSetting>> {
    return this.http.post<ApiResponse<AppSetting>>(`${this.baseUrl}/settings`, setting);
  }
}
