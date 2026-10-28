package com.xyz.rims.config;

import com.xyz.rims.model.*;
import com.xyz.rims.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockBalanceRepository stockBalanceRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping initial data generation.");
            return;
        }

        log.info("Seeding initial demonstration data for XYZ Retail Corporation (PRG_RIMS_001)...");

        // 1. Users
        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("Admin@123"))
                .fullName("System Administrator")
                .email("admin@xyzretail.com")
                .role(Role.ROLE_ADMIN)
                .active(true)
                .build();

        User manager = User.builder()
                .username("manager")
                .password(passwordEncoder.encode("Manager@123"))
                .fullName("Inventory Lead Manager")
                .email("manager@xyzretail.com")
                .role(Role.ROLE_INVENTORY_MANAGER)
                .active(true)
                .build();

        User staff = User.builder()
                .username("staff")
                .password(passwordEncoder.encode("Staff@123"))
                .fullName("Store Operations Staff")
                .email("staff@xyzretail.com")
                .role(Role.ROLE_STAFF)
                .active(true)
                .build();

        userRepository.saveAll(List.of(admin, manager, staff));

        // 2. Categories
        Category catElectronics = Category.builder().name("Consumer Electronics").description("Smart devices, computers and audio accessories").build();
        Category catApparel = Category.builder().name("Apparel & Footwear").description("Men and women clothing, sportswear and shoes").build();
        Category catHome = Category.builder().name("Home & Kitchen").description("Appliances, cookware and home essentials").build();
        Category catOffice = Category.builder().name("Office & Stationery").description("Office supplies, furniture and stationery").build();

        categoryRepository.saveAll(List.of(catElectronics, catApparel, catHome, catOffice));

        // 3. Warehouses
        Warehouse whCentral = Warehouse.builder()
                .code("WH-CENTRAL")
                .name("Central Distribution Hub")
                .type("WAREHOUSE")
                .address("104 Logistics Parkway, Sector 18")
                .city("Metro City")
                .phone("+1-555-019-2831")
                .active(true)
                .build();

        Warehouse whStore = Warehouse.builder()
                .code("STR-NORTH-101")
                .name("North Galleria Flagship Store")
                .type("RETAIL_STORE")
                .address("450 Commercial Avenue")
                .city("Northbridge")
                .phone("+1-555-019-4492")
                .active(true)
                .build();

        warehouseRepository.saveAll(List.of(whCentral, whStore));

        // 4. Suppliers
        Supplier supApex = Supplier.builder()
                .name("Apex Global Tech Logistics")
                .contactPerson("Marcus Vance")
                .email("procurement@apexlogistics.com")
                .phone("+1-800-555-9081")
                .address("78 Harbor Industrial Way, Bay City")
                .status("ACTIVE")
                .build();

        Supplier supPrime = Supplier.builder()
                .name("Prime Lifestyle & Apparel Co.")
                .contactPerson("Elena Rostova")
                .email("orders@primelifestyle.com")
                .phone("+1-800-555-4321")
                .address("12 Cotton Mill Road, Textile District")
                .status("ACTIVE")
                .build();

        supplierRepository.saveAll(List.of(supApex, supPrime));

        // 5. Products
        Product p1 = Product.builder()
                .sku("SKU-ELE-001")
                .name("AeroPulse Wireless Noise-Cancelling Headphones")
                .description("Over-ear Bluetooth headphones with active ANC and 40h battery")
                .category(catElectronics)
                .brand("AeroPulse")
                .barcode("890100100001")
                .costPrice(BigDecimal.valueOf(65.00))
                .sellingPrice(BigDecimal.valueOf(129.99))
                .currentStock(45)
                .reorderLevel(15)
                .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300")
                .active(true)
                .build();

        Product p2 = Product.builder()
                .sku("SKU-ELE-002")
                .name("UltraSlim 4K UHD Smart Monitor 27-inch")
                .description("IPS HDR400 display with USB-C 65W power delivery")
                .category(catElectronics)
                .brand("ViewMatrix")
                .barcode("890100100002")
                .costPrice(BigDecimal.valueOf(180.00))
                .sellingPrice(BigDecimal.valueOf(299.99))
                .currentStock(8) // Low stock!
                .reorderLevel(10)
                .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300")
                .active(true)
                .build();

        Product p3 = Product.builder()
                .sku("SKU-APP-001")
                .name("TechKnit Breathable Running Shoes (Navy)")
                .description("Ergonomic cushioning and breathable mesh runners")
                .category(catApparel)
                .brand("Velocity")
                .barcode("890100100003")
                .costPrice(BigDecimal.valueOf(32.50))
                .sellingPrice(BigDecimal.valueOf(79.99))
                .currentStock(0) // Out of stock!
                .reorderLevel(20)
                .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300")
                .active(true)
                .build();

        Product p4 = Product.builder()
                .sku("SKU-HOM-001")
                .name("Precision Barista Espresso Machine 15-Bar")
                .description("Stainless steel thermal block espresso machine with steam wand")
                .category(catHome)
                .brand("Caffina")
                .barcode("890100100004")
                .costPrice(BigDecimal.valueOf(110.00))
                .sellingPrice(BigDecimal.valueOf(219.50))
                .currentStock(25)
                .reorderLevel(8)
                .imageUrl("https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=300")
                .active(true)
                .build();

        Product p5 = Product.builder()
                .sku("SKU-OFF-001")
                .name("ErgoPro Mesh Executive Office Chair")
                .description("Lumbar support, 3D armrests, and synchronous tilt mechanism")
                .category(catOffice)
                .brand("ErgoLine")
                .barcode("890100100005")
                .costPrice(BigDecimal.valueOf(95.00))
                .sellingPrice(BigDecimal.valueOf(189.00))
                .currentStock(4) // Low stock!
                .reorderLevel(10)
                .imageUrl("https://images.unsplash.com/photo-1580481077195-c9431872df21?w=300")
                .active(true)
                .build();

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5));

        // 6. Stock Balances
        StockBalance sb1Central = StockBalance.builder().product(p1).warehouse(whCentral).quantity(35).lastUpdated(LocalDateTime.now()).build();
        StockBalance sb1Store = StockBalance.builder().product(p1).warehouse(whStore).quantity(10).lastUpdated(LocalDateTime.now()).build();

        StockBalance sb2Central = StockBalance.builder().product(p2).warehouse(whCentral).quantity(6).lastUpdated(LocalDateTime.now()).build();
        StockBalance sb2Store = StockBalance.builder().product(p2).warehouse(whStore).quantity(2).lastUpdated(LocalDateTime.now()).build();

        StockBalance sb4Central = StockBalance.builder().product(p4).warehouse(whCentral).quantity(20).lastUpdated(LocalDateTime.now()).build();
        StockBalance sb4Store = StockBalance.builder().product(p4).warehouse(whStore).quantity(5).lastUpdated(LocalDateTime.now()).build();

        StockBalance sb5Central = StockBalance.builder().product(p5).warehouse(whCentral).quantity(4).lastUpdated(LocalDateTime.now()).build();

        stockBalanceRepository.saveAll(List.of(sb1Central, sb1Store, sb2Central, sb2Store, sb4Central, sb4Store, sb5Central));

        // 7. Initial Stock Movements
        StockMovement mov1 = StockMovement.builder()
                .product(p1)
                .destinationWarehouse(whCentral)
                .movementType(StockMovement.MovementType.RECEIVING)
                .quantity(50)
                .previousStock(0)
                .newStock(50)
                .referenceNumber("INIT-PO-001")
                .userResponsible("admin")
                .remarks("Initial inventory onboarding")
                .timestamp(LocalDateTime.now().minusDays(3))
                .build();

        StockMovement mov2 = StockMovement.builder()
                .product(p1)
                .sourceWarehouse(whCentral)
                .destinationWarehouse(whStore)
                .movementType(StockMovement.MovementType.TRANSFER_OUT)
                .quantity(10)
                .previousStock(50)
                .newStock(50)
                .referenceNumber("TRF-001")
                .userResponsible("manager")
                .remarks("Transfer stock to flagship retail store")
                .timestamp(LocalDateTime.now().minusDays(2))
                .build();

        StockMovement mov3 = StockMovement.builder()
                .product(p1)
                .sourceWarehouse(whStore)
                .movementType(StockMovement.MovementType.SALE)
                .quantity(5)
                .previousStock(50)
                .newStock(45)
                .referenceNumber("POS-INV-1092")
                .userResponsible("staff")
                .remarks("Store POS walk-in sale")
                .timestamp(LocalDateTime.now().minusHours(4))
                .build();

        stockMovementRepository.saveAll(List.of(mov1, mov2, mov3));

        // 8. Customers
        Customer c1 = Customer.builder()
                .name("David Henderson")
                .email("david.h@example.com")
                .phone("+1-555-892-1200")
                .address("742 Evergreen Terr, Springfield")
                .build();

        Customer c2 = Customer.builder()
                .name("Sophia Martinez")
                .email("sophia.m@example.com")
                .phone("+1-555-771-3940")
                .address("18 Elmwood Court, Northbridge")
                .build();

        customerRepository.saveAll(List.of(c1, c2));

        log.info("Demonstration seed data initialization complete.");
    }
}
