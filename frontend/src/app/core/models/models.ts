export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface User {
  username: string;
  fullName: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_INVENTORY_MANAGER' | 'ROLE_STAFF';
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  username: string;
  fullName: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_INVENTORY_MANAGER' | 'ROLE_STAFF';
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id?: number;
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  categoryName?: string;
  brand?: string;
  barcode?: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  reorderLevel: number;
  imageUrl?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id?: number;
  code: string;
  name: string;
  type: string;
  address?: string;
  city?: string;
  phone?: string;
  active: boolean;
}

export interface StockBalance {
  id?: number;
  product: Product;
  warehouse: Warehouse;
  quantity: number;
  lastUpdated: string;
}

export interface StockMovement {
  id?: number;
  product: Product;
  sourceWarehouse?: Warehouse;
  destinationWarehouse?: Warehouse;
  movementType: 'RECEIVING' | 'SALE' | 'ADJUSTMENT' | 'TRANSFER_OUT' | 'TRANSFER_IN';
  quantity: number;
  previousStock: number;
  newStock: number;
  referenceNumber: string;
  userResponsible: string;
  remarks?: string;
  timestamp: string;
}

export interface Supplier {
  id?: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  createdAt?: string;
}

export interface PurchaseOrderItem {
  id?: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantityOrdered: number;
  quantityReceived?: number;
  unitCost: number;
  totalCost?: number;
}

export interface PurchaseOrder {
  id?: number;
  poNumber?: string;
  supplierId: number;
  supplierName?: string;
  warehouseId: number;
  warehouseName?: string;
  status: 'DRAFT' | 'PLACED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  totalAmount?: number;
  orderDate?: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  notes?: string;
  createdByUser?: string;
  items: PurchaseOrderItem[];
  createdAt?: string;
}

export interface Customer {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface AppUser {
  id?: number;
  username: string;
  password?: string;
  fullName: string;
  email: string;
  role: 'ROLE_ADMIN' | 'ROLE_INVENTORY_MANAGER' | 'ROLE_STAFF';
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppSetting {
  id?: number;
  settingKey: string;
  settingValue: string;
  description?: string;
}

export interface CustomerOrderItem {
  id?: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface CustomerOrder {
  id?: number;
  orderNumber?: string;
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  warehouseId: number;
  warehouseName?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  paymentMethod: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  orderDate?: string;
  notes?: string;
  createdByUser?: string;
  items: CustomerOrderItem[];
  createdAt?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalInventoryValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingOrdersCount: number;
  totalSuppliers: number;
  totalRevenue: number;
  lowStockProducts: Product[];
  recentMovements: StockMovement[];
  topSellingProducts: { productId: number; name: string; totalSold: number }[];
  stockByCategory: { [key: string]: number };
  monthlySales: { [key: string]: number };
}

export interface ReorderRecommendation {
  productId: number;
  sku: string;
  productName: string;
  categoryName: string;
  currentStock: number;
  reorderLevel: number;
  recommendedOrderQuantity: number;
  estimatedCost: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'OPTIMAL' | 'EXCESS';
  reason: string;
}

export interface AuditLog {
  id: number;
  entityName: string;
  entityId: number;
  action: string;
  performedBy: string;
  details: string;
  timestamp: string;
}
