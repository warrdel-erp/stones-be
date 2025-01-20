    -- products

CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('Slab', 'Pavers', 'Bench', 'Table', 'Sink', 'Mirror') NOT NULL,
    base_color ENUM('Black', 'Beige', 'Blue', 'Dark Blue', 'Brown', 'Pink', 'Gold', 'Gray', 'Crimson', 'Red', 'Dark Red', 'Mute Red', 'White', 'Yellow', 'Green', 'Sea Green', 'Mute sea green', 'light Green'),
    origin ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'),
    category ENUM('GRANITE', 'LIMESTONE', 'MARBLE', 'QUARTZ', 'QUARTZITE', 'SOAPSTONE'),
    alternative_name VARCHAR(255),
    kind ENUM('Stock', 'Non-stock') NOT NULL,
    sub_category VARCHAR(255),
    groups_all VARCHAR(255),
    finish VARCHAR(255),
    thickness VARCHAR(255),
    serial_name VARCHAR(255),
    uom_group ENUM('lb', 'in', 'CF', 'CM', 'SF', 'Kg', 'SQM', 'CBM', 'EA') NOT NULL,
    weight VARCHAR(255),
    single_slab VARCHAR(255) NOT NULL,
    bundle VARCHAR(255),
    price_range ENUM('low', 'mid', 'high', 'very high'),
    gl_inventory_link_account VARCHAR(255),
    gl_income_account VARCHAR(255),
    gl_cost_goods_account VARCHAR(255),
    safety_stock VARCHAR(255),
    reorder_quantity VARCHAR(255),
    lead_time VARCHAR(255),
    assigned_time ENUM('A1', 'A2', 'A3', 'B1', 'B2', 'B3'),
    preferred_supplier VARCHAR(255),
    manufacture VARCHAR(255),
    purchase_unit VARCHAR(255),
    quantity VARCHAR(255),
    supplier_product VARCHAR(255),
    supplier_sku VARCHAR(255),
    avr_estimate_cost VARCHAR(255),
    notes VARCHAR(255),
    instructions VARCHAR(255),
    disclaimer VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- users

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    userid VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (userid)
);

-- supplier

CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(255),
    supplier_type ENUM('National', 'International'),
    contact_name VARCHAR(255),
    parent_location VARCHAR(255) NOT NULL,
    print_name VARCHAR(255) NOT NULL,
    language ENUM('English', 'French', 'Spanish', 'Italian'),
    parent_supplier VARCHAR(255),
    supplier_since DATE,
    port VARCHAR(255),
    markup_multiplier FLOAT,
    discount FLOAT,
    primary_phone_no VARCHAR(255) NOT NULL,
    secondary_phone_no VARCHAR(255),
    landline_no VARCHAR(255),
    email VARCHAR(255),
    accounting_email VARCHAR(255),
    remit_address VARCHAR(255),
    remit_suite VARCHAR(255),
    remit_city VARCHAR(255),
    remit_state VARCHAR(255),
    remit_zip INTEGER,
    remit_country ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'),
    shipping_address VARCHAR(255),
    shipping_suite VARCHAR(255),
    shipping_city VARCHAR(255),
    shipping_state VARCHAR(255),
    shipping_zip INTEGER,
    shipping_country ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'),
    delivery_notes VARCHAR(255),
    internal_notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- settings Table (Master)

CREATE TABLE IF NOT EXISTS settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    setting_value JSON NOT NULL,
    setting_type VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- setting Table (Master Data Insert)

    INSERT INTO settings (setting_key, setting_value, setting_type) VALUES 
    ('country', '["Vietnam", "Angola", "Brazil", "Canada", "China", "Greece", "India", "Italy", "Norway", "Saudi Arabia", "South Africa", "Spain", "Ukraine"]', 'generic'),
    ('language', '["English", "French", "Spanish", "Italian"]', 'generic'),
    ('supplierType', '["National", "International"]', 'supplier'),
    ('productTypeEnum', '["Slab", "Pavers", "Bench", "Table", "Sink", "Mirror"]', 'product'),
    ('productCategoryEnum', '["GRANITE", "LIMESTONE", "MARBLE", "QUARTZ", "QUARTZITE", "SOAPSTONE"]', 'product'),
    ('productColoursEnum', '["Black", "Beige", "Blue", "Dark Blue", "Brown", "Pink", "Gold", "Gray", "Crimson", "Red", "Dark Red", "Mute Red", "White", "Yellow", "Green", "Sea Green", "Mute sea green", "light Green"]', 'product'),
    ('productOriginEnum', '["Vietnam", "Angola", "Brazil", "Canada", "China", "Greece", "India", "Italy", "Norway", "Saudi Arabia", "South Africa", "Spain", "Ukraine"]', 'product'),
    ('productUomEnum', '["lb", "in", "CF", "CM", "SF", "Kg", "SQM", "CBM", "EA"]', 'product'),
    ('productPriceRangeEnum', '["low", "mid", "high", "very high"]', 'product'),
    ('productAssignedBinEnum', '["A1", "A2", "A3", "B1", "B2", "B3"]', 'product');


-- add column in suppliers

ALTER TABLE suppliers ADD COLUMN status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE suppliers ADD COLUMN payment_term INTEGER;

ALTER TABLE suppliers ADD COLUMN currency VARCHAR(255);

-- add payment_terms in settings

INSERT INTO settings (setting_key, setting_value, setting_type) VALUES 
    ('payment_terms', '[30, 45, 60, 90, 120]', 'generic');

-- change value in country settings table 

delete from settings where setting_key ='country';
INSERT INTO settings (setting_key, setting_value, setting_type) VALUES 
    ('country', '[{"name": "Vietnam", "currency": "VND"}, {"name": "Angola", "currency": "AOA"}, {"name": "Brazil", "currency": "BRL"}, {"name": "Canada", "currency": "CAD"}, {"name": "China", "currency": "CNY"}, {"name": "Greece", "currency": "EUR"}, {"name": "India", "currency": "INR"}, {"name": "Italy", "currency": "EUR"}, {"name": "Norway", "currency": "NOK"}, {"name": "Saudi Arabia", "currency": "SAR"}, {"name": "South Africa", "currency": "ZAR"}, {"name": "Spain", "currency": "EUR"}, {"name": "Ukraine", "currency": "UAH"}]', 'generic');

-- add  new fields FOREIGN KEY & status in products table

-- ALTER TABLE products
-- ADD COLUMN supplier_id INTEGER NOT NULL,
-- ADD CONSTRAINT fk_supplierId
-- FOREIGN KEY (supplier_id)
-- REFERENCES suppliers(supplier_id);

ALTER TABLE products ADD COLUMN status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- location table

CREATE TABLE IF NOT EXISTS locations (
    location_id INT AUTO_INCREMENT PRIMARY KEY,
    location VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    suite VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    zip INTEGER NOT NULL,
    country VARCHAR(255) NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    purchase_location BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIME NULL
);

-- purchase table 

CREATE TABLE IF NOT EXISTS purchase_orders (
    purchase_order_id INT AUTO_INCREMENT PRIMARY KEY,
    po INTEGER NOT NULL UNIQUE,
    po_date DATE NOT NULL,
    supplier_so VARCHAR(255),
    required_ship_date DATE,
    eta_date DATE,
    po_expire_date DATE,
    container VARCHAR(255),
    delivery_date ENUM('Pickup', 'Delivery', 'Other'),
    shipment_terms ENUM('Prepaid', 'Prepaid & Add', 'Collect', 'Prepaid & COD', 'Add & COD', 'Collect & COD', 'Credit 45', 'CAD', 'Consignment'),
    payment_term INTEGER NOT NULL,
    freight_forwarder ENUM('Ace Drayage', 'Airlift (USA) Inc', 'AJ Worldwide services Inc', 'Avenger Logistics', 'CMA CGM (AMERICA) LLC', 'Crystal Granite (Ocean Freight)', 'DahNAY Logistics', 'Del Corona', 'Edmund Freight', 'Eurybia Logistics Inc', 'Ever Concord Logistics Inc', 'Fortuna Global Logistics LLC', 'Freight Experts Inc', 'General Noli USA Inc', 'Global Logistics & Customs of Charleston', 'Gramazini Freight', 'Heavy Weight 
    port, Inc', 'Howard Sheppard, Inc', 'Interglobog', 'LAM USA International Transport, LLC', 'Leonardi & Co. USA Inc', 'Optimal Container Logistics', 'Pacific Granites Inc', 'Pacific Quartz (Freight)', 'Patagon Logistics LLC', 'PKD Logistics', 'Savannah River Logistics, LLC', 'SBB Shipping USA Inc', 'Surfaces by Pacific (Freight)', 'Total Quality Logistics (TQL)', 'Tova Trucking, Inc', 'Trans-World Shipping Service, Inc', 'Trident Freight', 'U.S. Customs and Border Protection', 'Western Overseas Corp', 'World-Wide Transportation', 'Worldwide Express Inc', 'Xpress Logistic Solution LLP'),
    vessel VARCHAR(255),
    air_bill INTEGER,
    planned_ex_factorydate DATE,
    ex_factorydate DATE,
    departure_port VARCHAR(255),
    etd_port DATE NOT NULL,
    arrival_port VARCHAR(255),
    eta_port DATE,
    discharge_port VARCHAR(255),
    wiring_instruction VARCHAR(255),
    printed_notes VARCHAR(255),
    internal_notes VARCHAR(255),
    special_instruction VARCHAR(255),
    po_term_select VARCHAR(255),
    notes VARCHAR(255),
    other_charges ENUM('Consignment Payable', 'Delivery', 'Fabrication & Installation', 'FINANCE CHARGE', 'Insurance', 'Pre-migration Return/Pruchase', 'Vendor Credit'),
    account_number VARCHAR(255),
    description VARCHAR(255),
    charge FLOAT,
    status ENUM('OPEN', 'CLOSE', 'UNAPPROVED') NOT NULL DEFAULT 'OPEN',
    supplier_id INT NOT NULL,
    purchase_location_id INT NOT NULL,
    location_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES Suppliers(supplier_id),
    FOREIGN KEY (purchase_location_id) REFERENCES Locations(location_id),
    FOREIGN KEY (location_id) REFERENCES Locations(location_id)
);

-- Purchase order products

CREATE TABLE IF NOT EXISTS purchase_order_products (
    purchase_order_product_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT NOT NULL,
    product_id INT NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Pre Purchase Order
CREATE TABLE IF NOT EXISTS pre_purchase_orders (
    pre_purchase_order_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_product_id INT NOT NULL,
    description VARCHAR(255),
    supplier_note VARCHAR(255),
    purchase_quantity INT,
    purchase_uom VARCHAR(255),
    unit_price FLOAT,
    minimum_length FLOAT,
    minimum_width FLOAT,
    bundles INT,
    slab_bundles INT,
    slabs INT,
    quantity INT,
    final_unit_price FLOAT,
    total_price FLOAT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (purchase_order_product_id) REFERENCES purchase_order_products(purchase_order_product_id)
);


INSERT INTO settings (setting_key, setting_value, setting_type) VALUES
    ('delivery_type', '["Pickup", "Delivery", "Other"]', 'purchase'),
    ('shipment_term', '["Prepaid", "Prepaid & Add", "Collect", "Prepaid & COD", "Add & COD", "Collect & COD", "Credit 45", "CAD", "Consigment"]', 'purchase'),
    ('freight_forwarder', '["Ace Drayage", "Airlift (USA) Inc", "AJ Worldwide services Inc", "Avenger Logistics", "CMA CGM (AMERICA) LLC", "Crystal Granite (Ocean Freight)", "DahNAY Logistics", "Del Corona", "Edmund Freight", "Eurybia Logistics Inc", "Ever Concord Logistics Inc", "Fortuna Global Logistics LLC", "Freight Experts Inc", "General Noli USA Inc", "Global Logistics & Customs of Charleston", "Gramazini Freight", "Heavy Weight Transport, Inc", "Howard Sheppard, Inc", "Interglobog", "LAM USA International Transport, LLC", "Leonardi & Co. USA Inc", "Optimal Container Logistics", "Pacific Granites Inc", "Pacific Quartz (Freight)", "Patagon Logistics LLC", "PKD Logistics", "Savannah River Logistics, LLC", "SBB Shipping USA Inc", "Surfaces by Pacific (Freight)", "Total Quality Logistics (TQL)", "Tova Trucking, Inc", "Trans-World Shipping Service, Inc", "Trident Freight", "U.S. Customs and Border Protection", "Western Overseas Corp", "World-Wide Transportation", "Worldwide Express Inc", "Xpress Logistic Solution LLP"]', 'purchase'),
    ('other_charges', '["Consignment Payable","Delivery","Fabrication & Installation","FINANCE CHARGE","Insurance","Pre-migration Return/Pruchase","Vendor Credit"]','purchase');

-- Supplier Invoice Mapper table

CREATE TABLE IF NOT EXISTS po_supplier_invoice_mapper (
    po_supplier_invoice_mapper_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    purchase_order_id INTEGER NOT NULL,
    total_product_charges FLOAT,
    other_charges_total FLOAT,
    final_total_charges FLOAT,
    transaction VARCHAR(255),
    invoice VARCHAR(255),
    invoice_date DATE NOT NULL,
    ship_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('ACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id)
);

-- Supplier Invoice table

CREATE TABLE IF NOT EXISTS po_supplier_invoices (
    po_supplier_invoice_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    po_supplier_invoice_mapper_id INTEGER NOT NULL,
    purchase_order_product_id INTEGER NOT NULL,
    product_sku VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    supplier_notes VARCHAR(255),
    slab INTEGER,
    sqm FLOAT,
    uom FLOAT,
    quantity FLOAT,
    unit_price FLOAT,
    total_per_unit FLOAT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (po_supplier_invoice_mapper_id) REFERENCES po_supplier_invoice_mapper(po_supplier_invoice_mapper_id),
    FOREIGN KEY (purchase_order_product_id) REFERENCES purchase_order_products(purchase_order_product_id)
);

-- slab Details

CREATE TABLE IF NOT EXISTS po_slab_details (
    po_slab_detail_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    po_supplier_invoice_id INTEGER NOT NULL,
    po_supplier_invoice_mapper_id INTEGER NOT NULL,
    serial_number VARCHAR(255) NOT NULL,
    entry_unit VARCHAR(255),
    package_length FLOAT,
    package_width FLOAT,
    receving_length FLOAT,
    receving_width FLOAT,
    block INTEGER,
    lot INTEGER,
    slab INTEGER,
    bin ENUM('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6') NOT NULL,
    notes VARCHAR(255),
    slab_counter INTEGER NOT NULL,
    barcode VARCHAR(255),
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (po_supplier_invoice_id) REFERENCES po_supplier_invoices(po_supplier_invoice_id),
    FOREIGN KEY (po_supplier_invoice_mapper_id) REFERENCES po_supplier_invoice_mapper(po_supplier_invoice_mapper_id)
);

INSERT INTO settings (setting_key, setting_value, setting_type) VALUES ('slab_bin', '["A1", "A2","A3","A4", "A5","A6","B1","B2","B3","B4","B5","B6"]','purchase');

ALTER TABLE `purchase_order_products` ADD UNIQUE `unique_index`(`product_id`, `purchase_order_id`);

ALTER TABLE po_supplier_invoice_mapper ADD COLUMN receiving_inventory BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS product_inventory (
    product_inventory_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    product_id INTEGER NOT NULL,
    slab_in_stock FLOAT,
    quantity_in_stock FLOAT,
    slab_available ENUM('Available'),
    quantity_available ENUM('Available'),
    status ENUM('ACTIVE', 'INACTIVE'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

CREATE TABLE IF NOT EXISTS inventory_invoice_mapper (
    inventory_invoice_mapper_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    product_inventory_id INTEGER NOT NULL,
    po_supplier_invoice_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (product_inventory_id) REFERENCES product_inventory(product_inventory_id),
    FOREIGN KEY (po_supplier_invoice_id) REFERENCES po_supplier_invoices(po_supplier_invoice_id)
);


-- Adding data to setting api for customer table dropdown

INSERT INTO settings (setting_key, setting_value, setting_type) 
VALUES ('price_level', '["Single Slab", "Bundle", "Standard"]', 'customer');
INSERT INTO settings (setting_key, setting_value, setting_type) 
VALUES ('reason', '["Reseller"]', 'customer');

INSERT INTO settings (setting_key, setting_value, setting_type) 
VALUES ('customer_type', '["Homeowner", "Architect", "KB Dealer", "Designer", "Fabricator", "Builder"]', 'customer');
INSERT INTO settings (setting_key, setting_value, setting_type) 
VALUES ('docs_type', '["Fax", "Email", "Mail", "Text"]', 'customer');


INSERT INTO settings (setting_key, setting_value, setting_type) 
VALUES 
('sales_tax', 
'["GW - Georgia State, Gwinnett County - 6%",
"FR - Georgia State, Forsyth County - 7%",
"EX - Tax Exempt - 0%",
"FUL-ATL - Georgia State, FUL, City of Atlanta - 8.9%",
"FUL - Georgia State, Fulton County - 7.75%",
"COB - Georgia State, Cobb County - 6%",
"DAW - Georgia State, Dawson County - 7%",
"DEK - Georgia State, Dekalb County - 8%",
"DEK-ATL - Georgia State, DEK, City of Atlanta - 8.9%",
"DOU - Georgia State, Douglas County - 7%",
"COW - Georgia State, Coweta County Tax - 7%",
"CHE - Georgia State, Cherokee County Tax - 6%",
"CLAY - Georgia State, Clayton County Tax - 8%",
"HEN - Georgia Sate, Henry County Tax - 8%",
"FAY - Georgia State, Fayette County Tax - 7%",
"HAL - Georgia State, Hall County Tax - 7%",
"GRN - South Carolina State, Greenville County - 6%",
"PAU - Georgia State, Paulding County - 7%",
"FLOY - Georgia State, Floyd County - 7%",
"BAR - Georgia State, Bartow County - 7%",
"ROC - Georgia State, Rockdale County - 6%",
"LOW - Georgia State, Lowndes County - 8%",
"BARW - Georgia State, Barrow County - 8%",
"NEW - Georgia State, Newton County - 7%",
"JAC - Georgia State, Jackson County - 7%",
"ELB - Georgia State, Elbert County - 8%",
"DOD - Georgia State, Dodge County - 8%",
"ALMA - Alabama State, Madison County - 5.5%",
"BIB - Georgia State, Bibb County - 8%",
"WHF - Georgia State, Whitfield County - 7%",
"ALCH - Alabama State, Chambers County - 9%",
"TNHA - Tennessee State, Hamilton County - 9.25%",
"GOR - Georgia State, Gordon County - 7%",
"SCOC - South Carolina State, Oconee County - 6%",
"TWNS - Georgia State, Towns County - 8%",
"THOM - Georgia State, Thomas County - 7%",
"STE - Georgia State, Stephens County - 7%",
"TUR - Georgia State, Turner County - 8%",
"JAC-NC - North Carolina State , Jackson County - 7%",
"UNI - Georgia State, Union County - 7%",
"GIL - Georgia State, Gilmer County - 7%",
"OGL - Georgia State, Oglethorpe County - 8%",
"MSCG - Georgia State, Muscogee County - 9%",
"ALMO - Alabama State, Montgomery County - 10%"]', 
'customer');

--Create customer table in your database
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    print_name VARCHAR(255),
    parent_customer VARCHAR(255),
    primary_phone_number VARCHAR(255),
    secondary_phone_number VARCHAR(255),
    landline_number VARCHAR(255),
    acc_email VARCHAR(255),
    emails VARCHAR(255),
    address VARCHAR(255),
    suite VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    zip VARCHAR(255),
    s_address VARCHAR(255),
    s_unit VARCHAR(255),
    s_city VARCHAR(255),
    s_zip VARCHAR(255),
    s_state VARCHAR(255),
    p_sales_person VARCHAR(255),
    tax_exempt VARCHAR(255),
    sales_tax VARCHAR(255),
    exempt_certi VARCHAR(255),
    exempt_exipry VARCHAR(255),
    internal_notes VARCHAR(255),
    delivery_notes VARCHAR(255),
    po_required BOOLEAN,
    apply_finance_charges BOOLEAN,
    preferred_way_docs ENUM('Fax', 'Email','Mail', 'Text'),
    days_grace VARCHAR(255),
    days_hold VARCHAR(255),
    customerSince DATE,
    ein_number VARCHAR(255),
     country ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'),
     s_country ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'),
     customer_type ENUM('Homeowner', 'Architect', 'KB Dealer', 'Designer', 'Fabricator', 'Builder'),
     payment_terms ENUM('30', '45', '60', '90', '120'),
     reason ENUM('Reseller'),
     price_level ENUM('Single Slab','Bundle', 'Standard'),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE sales_orders (
    sales_orders_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    customer_id INTEGER NOT NULL,
    so INTEGER NOT NULL UNIQUE,
    so_date DATE NOT NULL,
    customer_po VARCHAR(255),
    location VARCHAR(255),
    ship_to ENUM('DELIVERY', 'PICKUP') NOT NULL,
    special_instruction VARCHAR(255),
    internal_notes VARCHAR(255),
    printed_notes VARCHAR(255),
    sub_total FLOAT,
    tax FLOAT,
    total FLOAT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE sales_orders_inventory (
    sales_orders_inventory_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    sales_orders_id INTEGER NOT NULL,
    product_inventory_id INTEGER NOT NULL,
    po_slab_detail_id INTEGER NOT NULL,
    so_loading_order_id INTEGER,
    unit_price FLOAT,
    sales_status ENUM('INITIATED','LOADING ORDER', 'PACKING LIST', 'INVOICE') NOT NULL DEFAULT 'INITIATED',
    remeasure_length FLOAT,
    remeasure_width FLOAT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (sales_orders_id) REFERENCES sales_orders(sales_orders_id),
    FOREIGN KEY (product_inventory_id) REFERENCES product_inventory(product_inventory_id),
    FOREIGN KEY (po_slab_detail_id) REFERENCES po_slab_details(po_slab_detail_id),
    FOREIGN KEY (so_loading_order_id) REFERENCES so_loading_order(so_loading_order_id)
);

CREATE TABLE so_loading_order (
    so_loading_order_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    sales_orders_id INTEGER NOT NULL,
    sub_total FLOAT,
    tax FLOAT,
    total FLOAT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (sales_orders_id) REFERENCES sales_orders(sales_orders_id)
);

ALTER TABLE sales_orders ADD COLUMN sales_tax VARCHAR(255);

ALTER TABLE so_loading_order ADD COLUMN sales_status ENUM('INITIATED', 'LOADING ORDER', 'PACKING LIST', 'INVOICE') NOT NULL DEFAULT 'INITIATED';

-- charts of account three table 

CREATE TABLE account_types (
  account_types_id INT PRIMARY KEY AUTO_INCREMENT,
  account_type ENUM('Assets','Liabilities','Revenue','Expenses', 'Equity Including Portion Attributable to Noncontrolling Interest','Other (Non-Operating) Income and Expenses','Intercompany and Related Party Accounts') NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME
);

CREATE TABLE sub_account_types (
  sub_account_types_id INT PRIMARY KEY AUTO_INCREMENT,
  account_types_id INT NOT NULL,
  sub_account_type ENUM('Cash and Financial Assets', 'Receivables and Contracts', 'Inventory', 'Accruals and Additional Assets', 'Property, Plant and Equipment','Intangible Assets (Excluding Goodwill)', 'Goodwill', 'Payables', 'Accruals, Deferrals and Other Liabilities', 'Financial Labilities', 'Commitments and Contingencies', 'Equity, Attributable to Parent', 'Retained Earnings (Accumulated Deficit)', 'Accumulated Other Comprehensive Income (Loss)', 'Other Equity Items', 'Equity, Attributable to Noncontrolling Interest' ,'Recognized Point Of Time', 'Recognized Over Time', 'Adjustments', 'Expenses Classified By Nature', 'Expenses Classified By Function', 'Other Revenue and Expenses', 'Gains and Losses', 'Taxes (Other Than Income and Payroll) and Fees', 'Income Tax Expense (Benefit)', 'Intercompany and Related Party Assets', 'Intercompany and Related Party Liabilities', 'Intercompany and Related Party Income and Expense') NOT NULL,
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (account_types_id) REFERENCES account_types(account_types_id)
);

CREATE TABLE accounts (
  accounts_id INT PRIMARY KEY AUTO_INCREMENT,
  sub_account_types_id INT NOT NULL,
  account_types_id INT,
  account_name VARCHAR(255) NOT NULL,
  opening_balance_date DATE,
  account_balance VARCHAR(255),
  status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (sub_account_types_id) REFERENCES sub_account_types(sub_account_types_id),
  FOREIGN KEY (account_types_id) REFERENCES account_types(account_types_id)
);

-- insert query for chart of account in account_type table . 

INSERT INTO account_types (account_type) VALUES ('Assets'), ('Liabilities'), ('Equity Including Portion Attributable to Noncontrolling Interest'), ('Revenue'), ('Expenses'), ('Other (Non-Operating) Income and Expenses'), ('Intercompany and Related Party Accounts');

-- insert query for chart of account in sub_account_types table . 

INSERT INTO sub_account_types (account_types_id, sub_account_type)
VALUES (1, 'Cash and Financial Assets'),
       (1, 'Receivables and Contracts'),
       (1, 'Inventory'),
       (1, 'Accruals and Additional Assets'),
       (1, 'Property, Plant and Equipment'),
       (1, 'Intangible Assets (Excluding Goodwill)'),
       (1, 'Goodwill'),
       (2, 'Payables'),
       (2, 'Accruals, Deferrals and Other Liabilities'),
       (2, 'Financial Labilities'),
       (2, 'Commitments and Contingencies'),
       (3, 'Equity, Attributable to Parent'),
       (3, 'Retained Earnings (Accumulated Deficit)'),
       (3, 'Accumulated Other Comprehensive Income (Loss)'),
       (3, 'Other Equity Items'),
       (3, 'Equity, Attributable to Noncontrolling Interest'),
       (4, 'Recognized Point Of Time'),
       (4, 'Recognized Over Time'),
       (4, 'Adjustments'),
       (5, 'Expenses Classified By Nature'),    
       (5, 'Expenses Classified By Function'),
       (6, 'Other Revenue and Expenses'),
       (6, 'Gains and Losses'),
       (6, 'Taxes (Other Than Income and Payroll) and Fees'),
       (6, 'Income Tax Expense (Benefit)'),
       (7, 'Intercompany and Related Party Assets'),
       (7, 'Intercompany and Related Party Liabilities'),
       (7, 'Intercompany and Related Party Income and Expense');


ALTER TABLE pre_purchase_orders MODIFY COLUMN purchase_quantity FLOAT;

ALTER TABLE accounts DROP COLUMN status;

ALTER TABLE accounts ADD COLUMN can_delete BOOLEAN NOT NULL DEFAULT FALSE;

-- To add creation of data by whom
ALTER TABLE suppliers
ADD COLUMN created_at
ADD COLUMN created_by INT ,
ADD COLUMN updated_by INT;

ALTER TABLE purchase_orders
ADD COLUMN created_by INT ,
ADD COLUMN updated_by INT;

ALTER TABLE sales_orders
ADD COLUMN created_by INT ,
ADD COLUMN updated_by INT;

ALTER TABLE products
ADD COLUMN created_by INT ,
ADD COLUMN updated_by INT;

-- alter table product to remove 

ALTER TABLE products
DROP CONSTRAINT products_ibfk_1;
ALTER TABLE products
DROP COLUMN supplier_id;

-- role table create 
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(255) UNIQUE NOT NULL,
    role_description TEXT
);

 --permission table creation
  CREATE TABLE permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    module VARCHAR(255)
  );

  alter table permissions drop column permission_name;

 alter table permissions add column permission_name varchar(255);
  
-- user-role table creation 
CREATE TABLE user_roles (
    user_role_id INT AUTO_INCREMENT PRIMARY KEY ,
    user_id INT,
    role_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
  );
  
-- role and permission table creation
 CREATE TABLE role_permissions (
	role_permission_id INT PRIMARY KEY,
    role_id INT,
    permission_id INT,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
  );


INSERT INTO Roles (role_name, role_description)
VALUES ('Super Admin', 'Has full access to all modules and permissions including editing roles');
ALTER TABLE products
DROP COLUMN supplier_id;



--client table creation

CREATE TABLE clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    client_uuid CHAR(36) NOT NULL DEFAULT (UUID()),
    client_name VARCHAR(255),
    client_password VARCHAR(255),
    client_email VARCHAR(255) UNIQUE,
    client_location VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    createdBy CHAR(36),
    PRIMARY KEY (client_id), 
);



--user- client relation table
CREATE TABLE client_users (
    client_user_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    user_id INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deletedAt TIMESTAMP NULL,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(client_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


--added column created by in customers table

ALTER TABLE customers
ADD COLUMN created_by INT ,
ADD COLUMN updated_by INT;

ALTER TABLE account_transaction
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE account_types
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE accounts
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE inventory_invoice_mapper
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE po_supplier_invoice_mapper
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE po_supplier_invoices
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE pre_purchase_orders
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE product_inventory
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE purchase_order_products
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE purchase_payment
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE sales_orders_inventory
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE so_loading_order
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE sub_account_types
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

ALTER TABLE po_slab_details
ADD COLUMN created_by INT,
ADD COLUMN updated_by INT;

--dropped po column to remove unique key
ALTER TABLE purchase_orders 
DROP INDEX po_unique ;

ALTER TABLE sales_orders 
DROP INDEX so;

ALTER TABLE products 
DROP INDEX product_name ;

ALTER TABLE suppliers 
DROP INDEX supplier_name ;


--removed so foreign key from account_transaction table
ALTER TABLE `stone_design`.`account_transaction` 
DROP FOREIGN KEY `account_transaction_ibfk_6`;
ALTER TABLE `stone_design`.`account_transaction` 
DROP INDEX `so` ;
;


ALTER TABLE customers ADD CONSTRAINT unique_email UNIQUE (emails);
ALTER TABLE customers ADD CONSTRAINT unique_primary_phone_number UNIQUE (primary_phone_number);


ALTER TABLE suppliers ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE suppliers ADD CONSTRAINT unique_primary_phone_number UNIQUE (primary_phone_no);


ALTER TABLE po_slab_details
MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'RETURNED') NOT NULL DEFAULT 'ACTIVE';


-- create opportunity table
CREATE TABLE opportunity (
    opportunity_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    customer_id INTEGER NOT NULL,
    op INTEGER NOT NULL UNIQUE,
    op_date DATE NOT NULL,
    customer_po VARCHAR(255),
    location VARCHAR(255),
    ship_to ENUM('DELIVERY', 'PICKUP') NOT NULL,
    special_instruction VARCHAR(255),
    internal_notes VARCHAR(255),
    printed_notes VARCHAR(255),
    sub_total FLOAT,
    tax FLOAT,
    total FLOAT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- CREATE SELECTION SHEET FOR OPPORUTNITY
CREATE TABLE opportunity_selection_sheet (
    op_selection_id INTEGER PRIMARY KEY AUTO_INCREMENT,
    selection_sheet_id VARCHAR(255) NOT NULL,
    opportunity_id INTEGER NOT NULL,
    product_inventory_id INTEGER NOT NULL,
    po_slab_detail_id INTEGER NOT NULL,
    status ENUM('HOLD', 'SALES ORDER'),
    created_by  INTEGER NOT NULL, 
    updated_by INTEGER, 
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  
    FOREIGN KEY (opportunity_id) REFERENCES opportunity(opportunity_id),
    FOREIGN KEY (product_inventory_id) REFERENCES product_inventory(product_inventory_id),
    FOREIGN KEY (po_slab_detail_id) REFERENCES po_slab_details(po_slab_detail_id)
);


-- Status of slab update to ONHOLD key added
ALTER TABLE po_slab_details
MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'RETURNED', 'ONHOLD') NOT NULL DEFAULT 'ACTIVE';

ALTER TABLE po_slab_details
ADD COLUMN addedToSelectionSheet TINYINT(1) NOT NULL DEFAULT 0;


ALTER TABLE `opportunity` 
DROP INDEX `op` ;
;


-- create freight bills
CREATE TABLE IF NOT EXISTS freight_bills (
    freight_bills_id INT PRIMARY KEY AUTO_INCREMENT,
    po_supplier_invoice_id INT NOT NULL,
    po_supplier_invoice_mapper_id INT NOT NULL,
    transaction_id VARCHAR(255),
    vendor_id INT,
    location VARCHAR(255),
    invoice VARCHAR(255),
    invoice_date DATE,  
    payment_terms ENUM('30', '45', '60', '90', '120'),
    due_date DATE,
    contacts_location VARCHAR(255),
    address VARCHAR(255),
    address_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip VARCHAR(20),
    country ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'),
    printed_notes VARCHAR(255),
    internal_notes VARCHAR(255),
    sub_total INT,
    total INT,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    FOREIGN KEY (po_supplier_invoice_id) REFERENCES po_supplier_invoices(po_supplier_invoice_id),
    FOREIGN KEY (po_supplier_invoice_mapper_id) REFERENCES po_supplier_invoice_mapper(po_supplier_invoice_mapper_id)
);

-- freight bills details

CREATE TABLE IF NOT EXISTS freight_bill_details (
    detail_id INT PRIMARY KEY AUTO_INCREMENT,
    freight_bills_id INT NOT NULL,
    accounts_id INT,
    locations VARCHAR(255),
    services VARCHAR(255),
    purchased_as VARCHAR(255),
    description VARCHAR(255),
    extended VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (freight_bills_id) REFERENCES freight_bills(freight_bills_id)
);
-- vendor table creation
CREATE TABLE IF NOT EXISTS vendors (
    vendor_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(255),
    vendor_type ENUM('National', 'International'),
    contact_name VARCHAR(255),
    vendor_since VARCHAR(255) NOT NULL,
    primary_phone_no VARCHAR(255) NOT NULL UNIQUE,  -- Unique constraint added
    secondary_phone_no VARCHAR(255),
    landline_no VARCHAR(255),
    email VARCHAR(255) UNIQUE,  -- Unique constraint added
    accounting_email VARCHAR(255),
    remit_address VARCHAR(255),
    remit_suite VARCHAR(255),
    remit_city VARCHAR(255),
    remit_state VARCHAR(255),
    remit_zip INTEGER,
    remit_country ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'),
    shipping_address VARCHAR(255),
    shipping_suite VARCHAR(255),
    shipping_city VARCHAR(255),
    shipping_state VARCHAR(255),
    shipping_zip INTEGER,
    shipping_country ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine'),
    payment_terms VARCHAR(255),
    currency VARCHAR(255),
    default_expense_account VARCHAR(255),
    default_payment_method VARCHAR(255),
    account VARCHAR(255),
    ein_number VARCHAR(255),
    memo_on_check VARCHAR(255),
    generic_vendor BOOLEAN,
    form_us_vendor BOOLEAN,
    freight_carrie BOOLEAN,
    sub_contractor BOOLEAN,
    allow_vendor_login BOOLEAN,
    internal_notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME
);



-- added columns in client table
ALTER TABLE clients
ADD COLUMN client_location_short_name VARCHAR(100),
ADD COLUMN client_type VARCHAR(100),
ADD COLUMN client_address VARCHAR(255),
ADD COLUMN client_country VARCHAR(100),
ADD COLUMN client_city VARCHAR(100),
ADD COLUMN pincode VARCHAR(20),
ADD COLUMN client_tax VARCHAR(50),
ADD COLUMN client_price_level INT,
ADD COLUMN payment_terms VARCHAR(100),
ADD COLUMN client_license_number VARCHAR(100),
ADD COLUMN user_count INT;


ALTER TABLE suppliers
MODIFY print_name VARCHAR(255);

UPDATE settings
SET setting_value = JSON_ARRAY_APPEND(setting_value, '$', 'COD')
WHERE setting_key = 'payment_terms';

ALTER TABLE customers
MODIFY payment_terms ENUM('30', '45', '60', '90', '120', 'COD');

ALTER TABLE freight_bills
MODIFY payment_terms ENUM('30', '45', '60', '90', '120', 'COD');

ALTER TABLE `vendors` 
DROP INDEX `vendor_name` ;

--adding the v
INSERT INTO vendors (vendor_name, vendor_since, primary_phone_no, freight_carrie)
VALUES
    ('Ace Drayage', '2024', '1234567890', TRUE),
    ('Airlift (USA) Inc', '2024', '1234567891', TRUE),
    ('AJ Worldwide services Inc', '2024', '1234567892', TRUE),
    ('Avenger Logistics', '2024', '1234567893', TRUE),
    ('CMA CGM (AMERICA) LLC', '2024', '1234567894', TRUE),
    ('Crystal Granite (Ocean Freight)', '2024', '1234567895', TRUE),
    ('DahNAY Logistics', '2024', '1234567896', TRUE),
    ('Del Corona', '2024', '1234567897', TRUE),
    ('Edmund Freight', '2024', '1234567898', TRUE),
    ('Eurybia Logistics Inc', '2024', '1234567899', TRUE),
    ('Ever Concord Logistics Inc', '2024', '1234567800', TRUE),
    ('Fortuna Global Logistics LLC', '2024', '1234567801', TRUE),
    ('Freight Experts Inc', '2024', '1234567802', TRUE),
    ('General Noli USA Inc', '2024', '1234567803', TRUE),
    ('Global Logistics & Customs of Charleston', '2024', '1234567804', TRUE),
    ('Gramazini Freight', '2024', '1234567805', TRUE),
    ('Heavy Weight Transport, Inc', '2024', '1234567806', TRUE),
    ('Howard Sheppard, Inc', '2024', '1234567807', TRUE),
    ('Interglobog', '2024', '1234567808', TRUE),
    ('LAM USA International Transport, LLC', '2024', '1234567809', TRUE),
    ('Leonardi & Co. USA Inc', '2024', '1234567810', TRUE),
    ('Optimal Container Logistics', '2024', '1234567811', TRUE),
    ('Pacific Granites Inc', '2024', '1234567812', TRUE),
    ('Pacific Quartz (Freight)', '2024', '1234567813', TRUE),
    ('Patagon Logistics LLC', '2024', '1234567814', TRUE),
    ('PKD Logistics', '2024', '1234567815', TRUE),
    ('Savannah River Logistics, LLC', '2024', '1234567816', TRUE),
    ('SBB Shipping USA Inc', '2024', '1234567817', TRUE),
    ('Surfaces by Pacific (Freight)', '2024', '1234567818', TRUE),
    ('Total Quality Logistics (TQL)', '2024', '1234567819', TRUE),
    ('Tova Trucking, Inc', '2024', '1234567820', TRUE),
    ('Trans-World Shipping Service, Inc', '2024', '1234567821', TRUE),
    ('Trident Freight', '2024', '1234567822', TRUE),
    ('U.S. Customs and Border Protection', '2024', '1234567823', TRUE),
    ('Western Overseas Corp', '2024', '1234567824', TRUE),
    ('World-Wide Transportation', '2024', '1234567825', TRUE),
    ('Worldwide Express Inc', '2024', '1234567826', TRUE),
    ('Xpress Logistic Solution LLP', '2024', '1234567827', TRUE);



ALTER TABLE purchase_orders
MODIFY COLUMN freight_forwarder INT, 
ADD CONSTRAINT fk_freight_forwarder 
FOREIGN KEY (freight_forwarder) REFERENCES vendors(vendor_id);


-- updates in the user roles tables 

ALTER TABLE `user_roles` 
DROP FOREIGN KEY `user_roles_ibfk_1`;
ALTER TABLE `user_roles` 
DROP INDEX `user_id` ;
;

CREATE INDEX idx_user_email ON users(email);

ALTER TABLE user_roles
ADD COLUMN user_email VARCHAR(255);

ALTER TABLE user_roles
ADD CONSTRAINT fk_user_email FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `user_roles` 
DROP COLUMN `user_id`;


ALTER TABLE user_roles
ADD COLUMN user_id INT,
ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE permissions
ADD COLUMN route VARCHAR(255);


ALTER TABLE permissions
ADD COLUMN route VARCHAR(255);


CREATE TABLE user_permissions (
    user_permission_id INT AUTO_INCREMENT PRIMARY KEY ,
    user_id INT,
    permission_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
  );
  

ALTER TABLE `stone_design`.`role_permissions` 
CHANGE COLUMN `role_permission_id` `role_permission_id` INT NOT NULL AUTO_INCREMENT ;
ALTER TABLE products
ADD COLUMN p_mfg_not_supplier BOOLEAN,
ADD COLUMN generic_product BOOLEAN,
ADD COLUMN customer_select_slab BOOLEAN,
ADD COLUMN non_serialized BOOLEAN,
ADD COLUMN invisible BOOLEAN;



ALTER TABLE permissions
DROP INDEX permission_name;


INSERT INTO settings (setting_key, setting_value, setting_type)
VALUES 
('permissionMap', 
    '{
        "/dashboard/all": ["DashboardRO"],
        "/purchaseOrder/allPo": ["PurchaseOrderRO"],
        "/purchaseOrder": ["PurchaseOrderRW"],
        "/purchaseOrder/inventoryDetailsBasedOnSipl": ["InventoryListRO"],
        "/salesOrder/allPo": ["SalesOrderRO"],
        "/salesOrder": ["SalesOrderRW"],
        "/return/all": ["ReturnRO"],
        "/return/returnSlabs": ["ReturnRW"],
        "/product/all": ["ProductRO"],
        "/product": ["ProductRW"],
        "/customer": ["CustomerRW"],
        "/customer/all": ["CustomerRO"],
        "/supplier": ["SupplierRW"],
        "/supplier/all": ["SupplierRO"],
        "/vendor/all": ["VendorRO"],
        "/vendor": ["VendorRW"],
        "/opportunity": ["OpportunityRW"],
        "/opportunity/all": ["OpportunityRO"],
        "/opportunity/selectionSheet": ["OpportunityRW"],
        "/opportunity/opportunityDetails": ["OpportunityRO"],
        "/opportunity/getProductInventory": ["OpportunityRO"],
        "/opportunity/selectionSheetDetails": ["OpportunityRO"]
    }', 
    'json'
);

UPDATE settings
SET setting_value = JSON_MERGE_PATCH(setting_value, '{
    "/accounts/": ["AccountRW"],
    "/accounts/all": ["AccountRO"],
    "/accounts/allTypes": ["AccountRO"],
    "/accounts/cashFinancialAssetList": ["AccountRO"],
    "/accounts/groupedListAccounts": ["AccountRO"],
    "/accounts/transactionDetailsCOA": ["AccountRO"],
    "/accounts/accountIdsByName": ["AccountRO"]
}')
WHERE setting_key = 'permissionMap';


INSERT INTO permissions (permission_name, description, module, route) VALUES 
    ('DashboardRO', 'Read-only access to the dashboard', 'Dashboard', '/dashboard/all'),
    ('PurchaseOrderRO', 'Read-only access to purchase orders', 'PurchaseOrder', '/purchaseOrder/allPo'),
    ('PurchaseOrderRW', 'Read and write access to purchase orders', 'PurchaseOrder', '/purchaseOrder'),
    ('InventoryListRO', 'Read-only access to inventory details based on supplier', 'Inventory', '/purchaseOrder/inventoryDetailsBasedOnSipl'),
    ('SalesOrderRO', 'Read-only access to sales orders', 'SalesOrder', '/salesOrder/allPo'),
    ('SalesOrderRW', 'Read and write access to sales orders', 'SalesOrder', '/salesOrder'),
    ('ReturnRO', 'Read-only access to returns', 'Return', '/return/all'),
    ('ReturnRW', 'Read and write access to return slabs', 'Return', '/return/returnSlabs'),
    ('ProductRO', 'Read-only access to products', 'Product', '/product/all'),
    ('ProductRW', 'Read and write access to products', 'Product', '/product'),
    ('CustomerRW', 'Read and write access to customer data', 'Customer', '/customer'),
    ('CustomerRO', 'Read-only access to customer data', 'Customer', '/customer/all'),
    ('SupplierRW', 'Read and write access to supplier data', 'Supplier', '/supplier'),
    ('SupplierRO', 'Read-only access to supplier data', 'Supplier', '/supplier/all'),
    ('VendorRO', 'Read-only access to vendor data', 'Vendor', '/vendor/all'),
    ('VendorRW', 'Read and write access to vendor data', 'Vendor', '/vendor'),
    ('OpportunityRW', 'Read and write access to opportunities', 'Opportunity', '/opportunity'),
    ('OpportunityRO', 'Read-only access to opportunities', 'Opportunity', '/opportunity/all'),
    ('OpportunityRW', 'Read and write access to opportunity selection sheet', 'Opportunity', '/opportunity/selectionSheet'),
    ('OpportunityRO', 'Read-only access to opportunity details', 'Opportunity', '/opportunity/opportunityDetails'),
    ('OpportunityRO', 'Read-only access to product inventory in opportunities', 'Opportunity', '/opportunity/getProductInventory'),
    ('OpportunityRO', 'Read-only access to selection sheet details', 'Opportunity', '/opportunity/selectionSheetDetails'),
    ('AccountRW', 'Read and write access to accounts', 'Accounts', '/accounts/'),
    ('AccountRO', 'Read-only access to all accounts', 'Accounts', '/accounts/all'),
    ('AccountRO', 'Read-only access to all account types', 'Accounts', '/accounts/allTypes'),
    ('AccountRO', 'Read-only access to cash financial asset list', 'Accounts', '/accounts/cashFinancialAssetList'),
    ('AccountRO', 'Read-only access to grouped list of accounts', 'Accounts', '/accounts/groupedListAccounts'),
    ('AccountRO', 'Read-only access to transaction details by chart of accounts', 'Accounts', '/accounts/transactionDetailsCOA'),
    ('AccountRO', 'Read-only access to account IDs by name', 'Accounts', '/accounts/accountIdsByName');

ALTER TABLE sales_orders 
MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'CLOSE', 'OPEN') NOT NULL DEFAULT 'ACTIVE';


ALTER TABLE so_loading_order 
MODIFY COLUMN status ENUM('ACTIVE', 'INACTIVE', 'CLOSE', 'OPEN') NOT NULL DEFAULT 'ACTIVE';
CREATE TABLE supplier_writing_instruction (
    id SERIAL PRIMARY KEY,  
    beneficiary_name VARCHAR(255) NOT NULL,       
    beneficiary_address VARCHAR(255) NOT NULL,     
    beneficiary_phone VARCHAR(50),                 
    beneficiary_mobile VARCHAR(50),               
    beneficiary_fax VARCHAR(50),                  
    bank_name VARCHAR(255) NOT NULL,               
    bank_address VARCHAR(255) NOT NULL,           
    bank_phone VARCHAR(50),                        
    bank_mobile VARCHAR(50),
    bank_fax VARCHAR(50),                         
    routing VARCHAR(50),                         
    account VARCHAR(50),                            
    swift_code VARCHAR(50),                        
    iban VARCHAR(50),                              
    internal_notes TEXT,                           
    supplier_id INT NOT NULL,                      
    FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE CASCADE 
);


ALTER TABLE supplier_writing_instruction
ADD COLUMN created_by INT,
ADD COLUMN  updated_by INT,
ADD COLUMN  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN deleted_at TIMESTAMP NULL;


CREATE TABLE IF NOT EXISTS client_locations (
    client_location_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT,
    location_id INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIME NULL,
    FOREIGN KEY (client_id) REFERENCES clients(client_id),
    FOREIGN KEY (location_id) REFERENCES locations(location_id)
);


CREATE TABLE IF NOT EXISTS container (
    container_id INT AUTO_INCREMENT PRIMARY KEY,
    container_number VARCHAR(50),
    received_on DATE,
    received_by VARCHAR(100),
    notes VARCHAR(255),
    po_supplier_invoice_mapper_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIME NULL,
    FOREIGN KEY (po_supplier_invoice_mapper_id) REFERENCES po_supplier_invoice_mapper(po_supplier_invoice_mapper_id)
);

-- If this table container table already exist in database
ALTER TABLE container
CHANGE COLUMN `container_number` `container_number` VARCHAR(255) NOT NULL ;



CREATE TABLE IF NOT EXISTS add_to_cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    po_slab_detail_id INT,
    created_by INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (po_slab_detail_id) REFERENCES po_slab_details(po_slab_detail_id) ON DELETE SET NULL
);


ALTER TABLE po_slab_details
ADD COLUMN slab_added_to_cart TINYINT(1) NOT NULL DEFAULT 0;


ALTER TABLE freight_bills
ADD COLUMN vendor_id INT,
ADD CONSTRAINT fk_vendor_id
    FOREIGN KEY (vendor_id)
    REFERENCES vendors(vendor_id)
    ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE account_transaction
ADD COLUMN vendor_id INT NULL, 
ADD CONSTRAINT fk_vendor_id_new
    FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id);  


INSERT INTO accounts (sub_account_types_id, account_types_id, account_name, account_balance, can_delete, opening_balance_date, created_at, updated_at)
VALUES 
(8, 2, 'Freight Payables ', 0, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO accounts (sub_account_types_id, account_types_id, account_name, account_balance, can_delete, opening_balance_date, created_at, updated_at)
VALUES 
(3, 1, 'Inventory in Transit', 0, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO accounts (sub_account_types_id, account_types_id, account_name, account_balance, can_delete, opening_balance_date, created_at, updated_at)
VALUES 
(21, 5, 'Cost of Goods & Services Sold', 0, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

ALTER TABLE freight_bills
ADD COLUMN created_by INT;


CREATE TABLE IF NOT EXISTS inventory_transfer (
    inventory_transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    po_slab_detail_id INT NULL,
    initiated_date DATE,
    required_ship_date DATE,
    eta_date DATE,
    delivery_method ENUM('DELIVERY', 'PICKUP') NOT NULL,
    shipment_terms ENUM(
        'Prepaid', 
        'Prepaid & Add', 
        'Collect', 
        'Prepaid & COD', 
        'Add & COD', 
        'Collect & COD', 
        'Credit 45', 
        'CAD', 
        'Consignment'
    ),
    transfer_from INT,
    transfer_to INT,
    freight_forwarder ENUM(
        'Ace Drayage', 
        'Airlift (USA) Inc', 
        'AJ Worldwide services Inc', 
        'Avenger Logistics', 
        'CMA CGM (AMERICA) LLC', 
        'Crystal Granite (Ocean Freight)', 
        'DahNAY Logistics', 
        'Del Corona', 
        'Edmund Freight', 
        'Eurybia Logistics Inc', 
        'Ever Concord Logistics Inc', 
        'Fortuna Global Logistics LLC', 
        'Freight Experts Inc', 
        'General Noli USA Inc', 
        'Global Logistics & Customs of Charleston', 
        'Gramazini Freight', 
        'Heavy Weight Port, Inc', 
        'Howard Sheppard, Inc', 
        'Interglobog', 
        'LAM USA International Transport, LLC', 
        'Leonardi & Co. USA Inc', 
        'Optimal Container Logistics', 
        'Pacific Granites Inc', 
        'Pacific Quartz (Freight)', 
        'Patagon Logistics LLC', 
        'PKD Logistics', 
        'Savannah River Logistics, LLC', 
        'SBB Shipping USA Inc', 
        'Surfaces by Pacific (Freight)', 
        'Total Quality Logistics (TQL)', 
        'Tova Trucking, Inc', 
        'Trans-World Shipping Service, Inc', 
        'Trident Freight', 
        'U.S. Customs and Border Protection', 
        'Western Overseas Corp', 
        'World-Wide Transportation', 
        'Worldwide Express Inc', 
        'Xpress Logistic Solution LLP'
    ),
    tracking_id VARCHAR(50),
    actual_ship_date DATE,
    pick_ticket_restriction ENUM('Exact Slab','Within Lot', 'Within Product'),
    printed_notes VARCHAR(255),
    internal_notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (po_slab_detail_id) REFERENCES po_slab_details(po_slab_detail_id) ON DELETE SET NULL
);

ALTER TABLE po_supplier_invoice_mapper
ADD COLUMN transaction_status ENUM('SIPL CREATED', 'SLAB ADDED', 'FREIGHT ADDED', 'CONTAINER ADDED', 'INVENTORY RECEIVED') 
DEFAULT 'SIPL CREATED';


ALTER TABLE products MODIFY COLUMN category VARCHAR(255);
ALTER TABLE products MODIFY COLUMN type VARCHAR(255) NULL;


ALTER TABLE sales_orders_inventory
ADD COLUMN slab_picked BOOLEAN NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS product_landed_cost (
    product_landed_cost_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    product_landed_cost INT,
    po_supplier_invoice_mapper_id INT,
    created_by INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL,
    FOREIGN KEY (po_supplier_invoice_mapper_id) REFERENCES po_supplier_invoice_mapper(po_supplier_invoice_mapper_id) ON DELETE SET NULL
);

ALTER TABLE purchase_orders MODIFY COLUMN etd_Port VARCHAR(255) NULL;

ALTER TABLE po_supplier_invoice_mapper
ADD COLUMN receive_inventory_date DATE;

-- First, add the product_id column to the table
ALTER TABLE po_supplier_invoices
ADD COLUMN product_id INTEGER;

-- Then, add the foreign key constraint
ALTER TABLE po_supplier_invoices
ADD CONSTRAINT fk_product_id_one
FOREIGN KEY (product_id) REFERENCES products(product_id);

SET GLOBAL sql_mode = (SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', ''));

ALTER TABLE po_slab_details
ADD COLUMN location_id INT,
ADD COLUMN product_id INT;

ALTER TABLE po_slab_details
ADD CONSTRAINT fk_location_id
FOREIGN KEY (location_id)
REFERENCES locations(location_id);

ALTER TABLE purchase_orders
ADD COLUMN purchase_order_status INT NOT NULL DEFAULT 1;

ALTER TABLE purchase_orders
ADD CONSTRAINT chk_purchase_order_status
CHECK (purchase_order_status BETWEEN 1 AND 100);

ALTER TABLE vendors ADD INDEX (vendor_id);
ALTER TABLE purchase_orders
MODIFY COLUMN freight_forwarder INT;

ALTER TABLE purchase_orders
ADD CONSTRAINT fk_freight_forwarder
FOREIGN KEY (freight_forwarder) REFERENCES vendors(vendor_id)
ON DELETE SET NULL
ON UPDATE CASCADE;


ALTER TABLE locations ADD INDEX (location_id);

ALTER TABLE purchase_orders MODIFY COLUMN purchase_location_id INT;

ALTER TABLE purchase_orders
ADD CONSTRAINT fk_purchase_location
FOREIGN KEY (purchase_location_id) REFERENCES locations(location_id)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE products ADD INDEX (product_name);

ALTER TABLE products ADD UNIQUE (product_name);

ALTER TABLE po_supplier_invoices MODIFY COLUMN product_sku VARCHAR(255);

ALTER TABLE po_supplier_invoices
ADD CONSTRAINT fk_product_sku
FOREIGN KEY (product_sku) REFERENCES products(product_name)
ON DELETE NO ACTION
ON UPDATE CASCADE;

ALTER TABLE users ADD INDEX (email);

ALTER TABLE user_roles MODIFY COLUMN user_email VARCHAR(255);

ALTER TABLE user_roles
ADD CONSTRAINT fk_user_email
FOREIGN KEY (user_email) REFERENCES users(email)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE sales_orders ADD INDEX (so);

ALTER TABLE account_transaction MODIFY COLUMN so INT;

ALTER TABLE account_transaction
ADD CONSTRAINT fk_so
FOREIGN KEY (so) REFERENCES sales_orders(so)
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE client_users
DROP FOREIGN KEY client_users_ibfk_3;

ALTER TABLE client_locations
DROP FOREIGN KEY client_locations_ibfk_1;

ALTER TABLE clients
MODIFY client_id INT AUTO_INCREMENT PRIMARY KEY;

ALTER TABLE client_users
  ADD CONSTRAINT client_users_ibfk_3 FOREIGN KEY (client_id)
  REFERENCES clients(client_id)
  ON DELETE CASCADE;

ALTER TABLE client_locations
  ADD CONSTRAINT client_locations_ibfk_1 FOREIGN KEY (client_id)
  REFERENCES clients(client_id)
  ON DELETE CASCADE;

ALTER TABLE sales_orders_inventory
ADD COLUMN tax FLOAT;

ALTER TABLE pre_purchase_orders
ADD COLUMN po_qty int;

CREATE TABLE product_other_charges (
    product_other_charges_id INT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id INT NOT NULL,
    account VARCHAR(255) DEFAULT NULL,
    charge_type VARCHAR(255) DEFAULT NULL,
    charge FLOAT DEFAULT NULL,
    description VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by INT DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    deleted_at TIME DEFAULT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(purchase_order_id)
);

ALTER TABLE sales_orders_inventory
ADD COLUMN packaging_width FLOAT;

ALTER TABLE sales_orders_inventory
ADD COLUMN packaging_length FLOAT;


-- Add pl_date and lo_date in sales_order_invertory
ALTER TABLE sales_orders_inventory
ADD COLUMN pl_date DATE;

ALTER TABLE sales_orders_inventory
ADD COLUMN lo_date DATE;

-- Add last selected location to users table.
ALTER TABLE users ADD COLUMN last_selected_location INT;

-- NEW STATUS FOR PO
ALTER TABLE purchase_orders 
MODIFY COLUMN status ENUM('OPEN', 'CLOSE', 'UNAPPROVED', 'APPROVED', 'CANCELLED');

alter table account_transaction
add column stage ENUM('purchase', 'poSlab', 'freightBill', 'inventory','payment') not null default 'purchase';

alter table po_supplier_invoice_mapper
add column total_product_quantity FLOAT;

ALTER TABLE freightBills
ADD COLUMN unit_fright FLOAT NULL;

alter table account_transaction 
add column purpose varchar(255);