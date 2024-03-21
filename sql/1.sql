-- products

CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(255),
    base_color VARCHAR(255),
    origin VARCHAR(255),
    category VARCHAR(255),
    alternative_name VARCHAR(255),
    kind VARCHAR(255),
    sub_category VARCHAR(255),
    groups_all VARCHAR(255),
    finish VARCHAR(255),
    thickness VARCHAR(255),
    serial_name VARCHAR(255),
    uom_group VARCHAR(255),
    weight VARCHAR(255),
    single_slab VARCHAR(255),
    bundle VARCHAR(255),
    price_range VARCHAR(255),
    gl_inventory_link_account VARCHAR(255),
    gl_income_account VARCHAR(255),
    gl_cost_goods_account VARCHAR(255),
    safety_stock VARCHAR(255),
    reorder_quantity VARCHAR(255),
    lead_time VARCHAR(255),
    assigned_time VARCHAR(255),
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
    deleted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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