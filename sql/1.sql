-- products

CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    userid VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- supplier

CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id SERIAL PRIMARY KEY,
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