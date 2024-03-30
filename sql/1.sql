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