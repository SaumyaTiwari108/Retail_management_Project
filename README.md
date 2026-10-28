# Retail Inventory Management System (RIMS)
**Project Code:** PRG_RIMS_001  
**Client:** XYZ Retail Corporation  
**Domain:** Retail Operations & Supply Chain Management  

---

## 1. System Overview & Technology Stack

RIMS is a full-stack, enterprise-grade Retail Operations and Inventory Management System designed with an Agile modular architecture. It provides real-time multi-location inventory tracking, purchase receiving, customer sales fulfillment, rule-based reorder intelligence, barcode/RFID scanning, and executive analytics.

### Mandatory Technology Stack
- **Frontend:** Angular 18 (TypeScript, Standalone Components, Angular Router, Reactive Form Validation)
- **UI & Styling:** Bootstrap 5, Bootstrap Icons, Custom SaaS enterprise design system, Chart.js
- **Backend:** Java 21, Spring Boot 3.3.5
- **Data Access:** Spring Data JPA & Hibernate, HikariCP Connection Pooling
- **Database:** MySQL 8.0 relational database (`rims_db`) with fallback H2 in-memory profile for automated testing
- **Security:** Spring Security 6, BCrypt password hashing, Stateless JWT Authentication & Role-based Authorization
- **API Documentation:** OpenAPI 3 / Swagger UI (`/api/swagger-ui.html`)
- **Build Tools:** Apache Maven 3.9+ for Backend, npm 11+ for Frontend

---

## 2. Architecture & Modules

```
c:\Retail_management_Project
├── backend/                               # Spring Boot 3.3 Application
│   ├── src/main/java/com/xyz/rims/
│   │   ├── config/                        # SecurityConfig, OpenApiConfig, DataInitializer
│   │   ├── controller/                    # REST API Controllers (10 Modules)
│   │   ├── dto/                           # Request & Response Data Transfer Objects
│   │   ├── exception/                     # GlobalExceptionHandler, Custom Exceptions
│   │   ├── model/                         # JPA Entities (Products, Orders, Stock, Warehouses)
│   │   ├── repository/                    # Spring Data JPA Repositories
│   │   ├── security/                      # JwtUtils, JwtFilter, CustomUserDetailsService
│   │   └── service/                       # Business logic services & implementations
│   └── src/main/resources/
│       ├── application.properties         # MySQL Production Configuration
│       └── application-test.properties    # H2 Automated Test Profile
└── frontend/                              # Angular 18 Standalone Single-Page Application
    └── src/app/
        ├── core/                          # API services, Auth state, JWT interceptor, Guard
        ├── shared/                        # Enterprise Layout, Navbar, Sidebar, Toasts
        └── features/                      # Standalone Feature Modules (Dashboard, Catalog, POS)
```

### Core Functional Modules
1. **Module A — Products & Categories:** Full CRUD with SKU/barcode uniqueness validation, pricing limits, image URLs, and safe deletion checks.
2. **Module B — Inventory Tracking & Movements:** Multi-type stock movements (`RECEIVING`, `SALE`, `ADJUSTMENT`, `TRANSFER`), previous-to-new stock balance reconciliation, and transactional consistency.
3. **Module C — Multi-Location Warehouses:** Multi-hub inventory balances across regional warehouses and retail stores with inter-warehouse stock transfer.
4. **Module D — Suppliers & Purchase Orders:** Vendor directory, purchase order issuance, expected deliveries, and automatic inventory updates upon stock receiving.
5. **Module E — Customer Orders & Fulfilment:** Point-of-Sale (POS) order creation, strict stock availability validation, automatic deduction, cancellation with stock restoration, and printable invoice generator.
6. **Module F — Smart Reorder Intelligence:** Rule-based replenishment assistant evaluating current stock against configured reorder points, calculating replenishment quantities and flagging critical stockout hazards or excess holdings.
7. **Module G — Barcode & RFID Support:** Scanner-focused input accepting real USB/Bluetooth barcode guns, instant product lookup, quick stock adjustments, and simulated high-frequency bulk RFID portal gate reader.
8. **Module H — Reports & Analytics:** Asset valuation reports, low-stock depletion reports, supplier purchase expenditures, and instant CSV export download.
9. **Module I — Role-Based Access Control:** Secure JWT authentication with BCrypt hashing and role restrictions:
   - `ROLE_ADMIN`: Full administrative control, deletion rights, user management, and audit inspection.
   - `ROLE_INVENTORY_MANAGER`: Catalog, stock movements, purchase orders, transfers, and reports.
   - `ROLE_STAFF`: Store-level POS order entry, scanning, and order receipt.
10. **Module J — Immutable Audit Trail:** Automated activity logging for product adjustments, status alterations, and user authorizations.

---

## 3. Seeded Demonstration Credentials

When first booted, `DataInitializer` seeds demonstration accounts (only when the database is empty):

| Username | Password | Role | Permissions |
| :--- | :--- | :--- | :--- |
| `admin` | `Admin@123` | `ROLE_ADMIN` | Full System Access, Delete Rights, Audit Trail |
| `manager` | `Manager@123` | `ROLE_INVENTORY_MANAGER` | Products, Stock Movements, Warehouses, Purchasing |
| `staff` | `Staff@123` | `ROLE_STAFF` | POS Order Entry, Receiving, Scanner Interface |

---

## 4. Setup & Running Instructions

### Prerequisites
- JDK 21 LTS (`java -version` & `javac -version`)
- Apache Maven 3.9+ (`mvn -version`)
- Node.js 18+ and npm (`node -v` & `npm -v`)
- MySQL Server 8.0 running on `localhost:3306`

### Step 1: Configure Database
1. Ensure MySQL Server is running.
2. In `backend/src/main/resources/application.properties`, configure your MySQL password:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/rims_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=YOUR_MYSQL_ROOT_PASSWORD
   ```
   *(Note: `createDatabaseIfNotExist=true` will automatically create the `rims_db` schema upon first launch).*

### Step 2: Build & Run Spring Boot Backend
```bash
cd backend
# Run automated tests
mvn clean test

# Start the application
mvn spring-boot:run
```
- API Base URL: `http://localhost:8080/api`
- Swagger OpenAPI Documentation: `http://localhost:8080/api/swagger-ui.html`

### Step 3: Run Angular Frontend
```bash
cd frontend
# Install dependencies (if not already installed)
npm install

# Start development server
npm start
```
- Web Application URL: `http://localhost:4200`
- Sign in using any of the quick-profile buttons (`Admin`, `Manager`, or `Staff`).

---

## 5. Automated Test Results

The backend contains automated tests verifying critical operations:
- `ProductServiceTest.java`: Product creation, SKU uniqueness constraint, and low-stock threshold queries.
- `InventoryServiceTest.java`: Receiving stock additions, POS sales deductions, and prevention of negative inventory balances.

Result:
```
[INFO] Tests run: 6, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```
