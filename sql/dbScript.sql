-- -----------------------------------------------------
-- Table `locations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `locations` (
  `location_id` INT NOT NULL AUTO_INCREMENT,
  `location` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `suite` VARCHAR(255) NOT NULL,
  `city` VARCHAR(255) NOT NULL,
  `state` VARCHAR(255) NOT NULL,
  `zip` INT NOT NULL,
  `country` VARCHAR(255) NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `purchase_location` TINYINT(1) NOT NULL DEFAULT '0',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` TIME NULL DEFAULT NULL,
  PRIMARY KEY (`location_id`),
  UNIQUE INDEX `location` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_2` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_3` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_4` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_5` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_6` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_7` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_8` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_9` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_10` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_11` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_12` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_13` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_14` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_15` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_16` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_17` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_18` (`location` ASC) VISIBLE,
  UNIQUE INDEX `location_19` (`location` ASC) VISIBLE);



-- -----------------------------------------------------
-- Table `purchase_orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `purchase_order_id` INT NOT NULL AUTO_INCREMENT,
  `po` INT NOT NULL,
  `po_date` DATETIME NOT NULL,
  `supplier_so` VARCHAR(255) NULL DEFAULT NULL,
  `required_ship_date` DATETIME NULL DEFAULT NULL,
  `eta_date` DATETIME NULL DEFAULT NULL,
  `po_expire_date` DATETIME NULL DEFAULT NULL,
  `container` VARCHAR(255) NULL DEFAULT NULL,
  `delivery_date` ENUM('Pickup', 'Delivery', 'Other') NULL DEFAULT NULL,
  `shipment_terms` ENUM('Prepaid', 'Prepaid & Add', 'Collect', 'Prepaid & COD', 'Add & COD', 'Collect & COD', 'Credit 45', 'CAD', 'Consigment') NULL DEFAULT NULL,
  `payment_term` INT NOT NULL,
  `freight_forwarder` ENUM('Ace Drayage', 'Airlift (USA) Inc', 'AJ Worldwide services Inc', 'Avenger Logistics', 'CMA CGM (AMERICA) LLC', 'Crystal Granite (Ocean Freight)', 'DahNAY Logistics', 'Del Corona', 'Edmund Freight', 'Eurybia Logistics Inc', 'Ever Concord Logistics Inc', 'Fortuna Global Logistics LLC', 'Freight Experts Inc', 'General Noli USA Inc', 'Global Logistics & Customs of Charleston', 'Gramazini Freight', 'Heavy Weight Transport, Inc', 'Howard Sheppard, Inc', 'Interglobog', 'LAM USA International Transport, LLC', 'Leonardi & Co. USA Inc', 'Optimal Container Logistics', 'Pacific Granites Inc', 'Pacific Quartz (Freight)', 'Patagon Logistics LLC', 'PKD Logistics', 'Savannah River Logistics, LLC', 'SBB Shipping USA Inc', 'Surfaces by Pacific (Freight)', 'Total Quality Logistics (TQL)', 'Tova Trucking, Inc', 'Trans-World Shipping Service, Inc', 'Trident Freight', 'U.S. Customs and Border Protection', 'Western Overseas Corp', 'World-Wide Transportation', 'Worldwide Express Inc', 'Xpress Logistic Solution LLP') NULL DEFAULT NULL,
  `vessel` VARCHAR(255) NULL DEFAULT NULL,
  `air_bill` INT NULL DEFAULT NULL,
  `planned_ex_factorydate` DATETIME NULL DEFAULT NULL,
  `ex_factorydate` DATETIME NULL DEFAULT NULL,
  `departure_port` VARCHAR(255) NULL DEFAULT NULL,
  `etd_port` DATETIME NOT NULL,
  `arrival_port` VARCHAR(255) NULL DEFAULT NULL,
  `eta_port` DATETIME NULL DEFAULT NULL,
  `discharge_port` VARCHAR(255) NULL DEFAULT NULL,
  `wiring_instruction` VARCHAR(255) NULL DEFAULT NULL,
  `printed_notes` VARCHAR(255) NULL DEFAULT NULL,
  `internal_notes` VARCHAR(255) NULL DEFAULT NULL,
  `special_instruction` VARCHAR(255) NULL DEFAULT NULL,
  `po_term_select` VARCHAR(255) NULL DEFAULT NULL,
  `notes` VARCHAR(255) NULL DEFAULT NULL,
  `other_charges` ENUM('Consignment Payable', 'Delivery', 'Fabrication & Installation', 'FINANCE CHARGE', 'Insurance', 'Pre-migration Return/Pruchase', 'Vendor Credit') NULL DEFAULT NULL,
  `account_number` VARCHAR(255) NULL DEFAULT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `charge` FLOAT NULL DEFAULT NULL,
  `status` ENUM('OPEN', 'CLOSE', 'UNAPPROVED') NOT NULL DEFAULT 'OPEN',
  `supplier_id` INT NOT NULL,
  `purchase_location_id` INT NOT NULL,
  `location_id` INT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_by` INT NULL DEFAULT NULL,
  `updated_by` INT NULL DEFAULT NULL,
  PRIMARY KEY (`purchase_order_id`),
  UNIQUE INDEX `po` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_2` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_3` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_4` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_5` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_6` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_7` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_8` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_9` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_10` (`po` ASC) VISIBLE,
  UNIQUE INDEX `po_11` (`po` ASC) VISIBLE,
  INDEX `supplier_id` (`supplier_id` ASC) VISIBLE,
  INDEX `purchase_location_id` (`purchase_location_id` ASC) VISIBLE,
  INDEX `location_id` (`location_id` ASC) VISIBLE,
  CONSTRAINT `purchase_orders_ibfk_2`
    FOREIGN KEY (`purchase_location_id`)
    REFERENCES `locations` (`location_id`),
  CONSTRAINT `purchase_orders_ibfk_3`
    FOREIGN KEY (`location_id`)
    REFERENCES `locations` (`location_id`));



-- -----------------------------------------------------
-- Table `po_supplier_invoice_mapper`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `po_supplier_invoice_mapper` (
  `po_supplier_invoice_mapper_id` INT NOT NULL AUTO_INCREMENT,
  `purchase_order_id` INT NOT NULL,
  `total_product_charges` FLOAT NULL DEFAULT NULL,
  `other_charges_total` FLOAT NULL DEFAULT NULL,
  `final_total_charges` FLOAT NULL DEFAULT NULL,
  `transaction` VARCHAR(255) NULL DEFAULT NULL,
  `invoice` VARCHAR(255) NULL DEFAULT NULL,
  `invoice_date` DATE NOT NULL,
  `ship_date` DATE NOT NULL,
  `due_date` DATE NOT NULL,
  `status` ENUM('ACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  `receiving_inventory` TINYINT(1) NULL DEFAULT '0',
  PRIMARY KEY (`po_supplier_invoice_mapper_id`),
  INDEX `purchase_order_id` (`purchase_order_id` ASC) VISIBLE,
  CONSTRAINT `po_supplier_invoice_mapper_ibfk_1`
    FOREIGN KEY (`purchase_order_id`)
    REFERENCES `purchase_orders` (`purchase_order_id`));



-- -----------------------------------------------------
-- Table `account_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `account_types` (
  `account_types_id` INT NOT NULL AUTO_INCREMENT,
  `account_type` ENUM('Assets', 'Liabilities', 'Revenue', 'Expenses', 'Equity Including Portion Attributable to Noncontrolling Interest', 'Other (Non-Operating) Income and Expenses', 'Intercompany and Related Party Accounts') NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`account_types_id`));



-- -----------------------------------------------------
-- Table `sub_account_types`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sub_account_types` (
  `sub_account_types_id` INT NOT NULL AUTO_INCREMENT,
  `account_types_id` INT NULL DEFAULT NULL,
  `sub_account_type` ENUM('Cash and Financial Assets', 'Receivables and Contracts', 'Inventory', 'Accruals and Additional Assets', 'Property, Plant and Equipment', 'Intangible Assets (Excluding Goodwill)', 'Goodwill', 'Payables', 'Accruals, Deferrals and Other Liabilities', 'Financial Labilities', 'Commitments and Contingencies', 'Equity, Attributable to Parent', 'Retained Earnings (Accumulated Deficit)', 'Accumulated Other Comprehensive Income (Loss)', 'Other Equity Items', 'Equity, Attributable to Noncontrolling Interest', 'Recognized Point Of Time', 'Recognized Over Time', 'Adjustments', 'Expenses Classified By Nature', 'Expenses Classified By Function', 'Other Revenue and Expenses', 'Gains and Losses', 'Taxes (Other Than Income and Payroll) and Fees', 'Income Tax Expense (Benefit)', 'Intercompany and Related Party Assets', 'Intercompany and Related Party Liabilities', 'Intercompany and Related Party Income and Expense') NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`sub_account_types_id`),
  INDEX `account_types_id` (`account_types_id` ASC) VISIBLE,
  CONSTRAINT `sub_account_types_ibfk_1`
    FOREIGN KEY (`account_types_id`)
    REFERENCES `account_types` (`account_types_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE);



-- -----------------------------------------------------
-- Table `customers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `customers` (
  `customer_id` INT NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(255) NOT NULL,
  `contact_name` VARCHAR(255) NULL DEFAULT NULL,
  `print_name` VARCHAR(255) NULL DEFAULT NULL,
  `parent_customer` VARCHAR(255) NULL DEFAULT NULL,
  `primary_phone_number` VARCHAR(255) NULL DEFAULT NULL,
  `secondary_phone_number` VARCHAR(255) NULL DEFAULT NULL,
  `landline_number` VARCHAR(255) NULL DEFAULT NULL,
  `acc_email` VARCHAR(255) NULL DEFAULT NULL,
  `emails` VARCHAR(255) NULL DEFAULT NULL,
  `address` VARCHAR(255) NULL DEFAULT NULL,
  `suite` VARCHAR(255) NULL DEFAULT NULL,
  `city` VARCHAR(255) NULL DEFAULT NULL,
  `state` VARCHAR(255) NULL DEFAULT NULL,
  `zip` VARCHAR(255) NULL DEFAULT NULL,
  `s_address` VARCHAR(255) NULL DEFAULT NULL,
  `s_unit` VARCHAR(255) NULL DEFAULT NULL,
  `s_city` VARCHAR(255) NULL DEFAULT NULL,
  `s_zip` VARCHAR(255) NULL DEFAULT NULL,
  `s_state` VARCHAR(255) NULL DEFAULT NULL,
  `p_sales_person` VARCHAR(255) NULL DEFAULT NULL,
  `tax_exempt` VARCHAR(255) NULL DEFAULT NULL,
  `sales_tax` VARCHAR(255) NULL DEFAULT NULL,
  `exempt_certi` VARCHAR(255) NULL DEFAULT NULL,
  `exempt_exipry` VARCHAR(255) NULL DEFAULT NULL,
  `internal_notes` VARCHAR(255) NULL DEFAULT NULL,
  `delivery_notes` VARCHAR(255) NULL DEFAULT NULL,
  `po_required` TINYINT(1) NULL DEFAULT NULL,
  `apply_finance_charges` TINYINT(1) NULL DEFAULT NULL,
  `preferred_way_docs` ENUM('Fax', 'Email', 'Mail', 'Text') NULL DEFAULT NULL,
  `days_grace` VARCHAR(255) NULL DEFAULT NULL,
  `days_hold` VARCHAR(255) NULL DEFAULT NULL,
  `customerSince` DATETIME NULL DEFAULT NULL,
  `ein_number` VARCHAR(255) NULL DEFAULT NULL,
  `country` ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine') NULL DEFAULT NULL,
  `s_country` ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine') NULL DEFAULT NULL,
  `customer_type` ENUM('Homeowner', 'Architect', 'KB Dealer', 'Designer', 'Fabricator', 'Builder') NULL DEFAULT NULL,
  `payment_terms` ENUM('30', '45', '60', '90', '120') NULL DEFAULT NULL,
  `reason` ENUM('Reseller') NULL DEFAULT NULL,
  `price_level` ENUM('Single Slab', 'Bundle', 'Standard') NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NULL DEFAULT 'ACTIVE',
  PRIMARY KEY (`customer_id`));



-- -----------------------------------------------------
-- Table `accounts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `accounts` (
  `accounts_id` INT NOT NULL AUTO_INCREMENT,
  `sub_account_types_id` INT NULL DEFAULT NULL,
  `account_types_id` INT NULL DEFAULT NULL,
  `account_name` VARCHAR(255) NOT NULL,
  `opening_balance_date` DATETIME NULL DEFAULT NULL,
  `account_balance` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  `can_delete` TINYINT(1) NOT NULL DEFAULT '0',
  `customer_id` INT NULL DEFAULT NULL,
  `coa_code` VARCHAR(50) NULL DEFAULT NULL,
  PRIMARY KEY (`accounts_id`),
  UNIQUE INDEX `coa_code` (`coa_code` ASC) VISIBLE,
  INDEX `sub_account_types_id` (`sub_account_types_id` ASC) VISIBLE,
  INDEX `account_types_id` (`account_types_id` ASC) VISIBLE,
  INDEX `fk_customer_id` (`customer_id` ASC) VISIBLE,
  CONSTRAINT `accounts_ibfk_1`
    FOREIGN KEY (`sub_account_types_id`)
    REFERENCES `sub_account_types` (`sub_account_types_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `accounts_ibfk_2`
    FOREIGN KEY (`account_types_id`)
    REFERENCES `account_types` (`account_types_id`),
  CONSTRAINT `fk_customer_id`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`customer_id`));



-- -----------------------------------------------------
-- Table `suppliers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `suppliers` (
  `supplier_id` INT NOT NULL AUTO_INCREMENT,
  `supplier_name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(255) NULL DEFAULT NULL,
  `supplier_type` ENUM('National', 'International') NULL DEFAULT NULL,
  `contact_name` VARCHAR(255) NULL DEFAULT NULL,
  `parent_location` VARCHAR(255) NOT NULL,
  `print_name` VARCHAR(255) NOT NULL,
  `language` ENUM('English', 'French', 'Spanish', 'Italian') NULL DEFAULT NULL,
  `parent_supplier` VARCHAR(255) NULL DEFAULT NULL,
  `supplier_since` DATETIME NULL DEFAULT NULL,
  `port` VARCHAR(255) NULL DEFAULT NULL,
  `markup_multiplier` FLOAT NULL DEFAULT NULL,
  `discount` FLOAT NULL DEFAULT NULL,
  `primary_phone_no` VARCHAR(255) NOT NULL,
  `secondary_phone_no` VARCHAR(255) NULL DEFAULT NULL,
  `landline_no` VARCHAR(255) NULL DEFAULT NULL,
  `email` VARCHAR(255) NULL DEFAULT NULL,
  `accounting_email` VARCHAR(255) NULL DEFAULT NULL,
  `remit_address` VARCHAR(255) NULL DEFAULT NULL,
  `remit_suite` VARCHAR(255) NULL DEFAULT NULL,
  `remit_city` VARCHAR(255) NULL DEFAULT NULL,
  `remit_state` VARCHAR(255) NULL DEFAULT NULL,
  `remit_zip` INT NULL DEFAULT NULL,
  `remit_country` ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine') NULL DEFAULT NULL,
  `shipping_address` VARCHAR(255) NULL DEFAULT NULL,
  `shipping_suite` VARCHAR(255) NULL DEFAULT NULL,
  `shipping_city` VARCHAR(255) NULL DEFAULT NULL,
  `shipping_state` VARCHAR(255) NULL DEFAULT NULL,
  `shipping_zip` INT NULL DEFAULT NULL,
  `shipping_country` ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine') NULL DEFAULT NULL,
  `delivery_notes` VARCHAR(255) NULL DEFAULT NULL,
  `internal_notes` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `payment_term` INT NULL DEFAULT NULL,
  `currency` VARCHAR(255) NULL DEFAULT NULL,
  `created_by` INT NULL DEFAULT NULL,
  `updated_by` INT NULL DEFAULT NULL,
  PRIMARY KEY (`supplier_id`),
  UNIQUE INDEX `supplier_name` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_2` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_3` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_4` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_5` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_6` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_7` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_8` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_9` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_10` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_11` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_12` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_13` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_14` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_15` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_16` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_17` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_18` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_19` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_20` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_21` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_22` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_23` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_24` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_25` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_26` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_27` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_28` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_29` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_30` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_31` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_32` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_33` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_34` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_35` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_36` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_37` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_38` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_39` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_40` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_41` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_42` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_43` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_44` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_45` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_46` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_47` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_48` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_49` (`supplier_name` ASC) VISIBLE,
  UNIQUE INDEX `supplier_name_50` (`supplier_name` ASC) VISIBLE);



-- -----------------------------------------------------
-- Table `sales_orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales_orders` (
  `sales_orders_id` INT NOT NULL AUTO_INCREMENT,
  `customer_id` INT NOT NULL,
  `so` INT NOT NULL,
  `so_date` DATE NOT NULL,
  `customer_po` VARCHAR(255) NULL DEFAULT NULL,
  `location` VARCHAR(255) NULL DEFAULT NULL,
  `ship_to` ENUM('DELIVERY', 'PICKUP') NOT NULL,
  `special_instruction` VARCHAR(255) NULL DEFAULT NULL,
  `internal_notes` VARCHAR(255) NULL DEFAULT NULL,
  `printed_notes` VARCHAR(255) NULL DEFAULT NULL,
  `sub_total` FLOAT NULL DEFAULT NULL,
  `tax` FLOAT NULL DEFAULT NULL,
  `total` FLOAT NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `sales_tax` VARCHAR(255) NULL DEFAULT NULL,
  `created_by` INT NULL DEFAULT NULL,
  `updated_by` INT NULL DEFAULT NULL,
  PRIMARY KEY (`sales_orders_id`),
  UNIQUE INDEX `so` (`so` ASC) VISIBLE,
  INDEX `customer_id` (`customer_id` ASC) VISIBLE,
  CONSTRAINT `sales_orders_ibfk_1`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`customer_id`));



-- -----------------------------------------------------
-- Table `so_loading_order`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `so_loading_order` (
  `so_loading_order_id` INT NOT NULL AUTO_INCREMENT,
  `sales_orders_id` INT NOT NULL,
  `sub_total` FLOAT NULL DEFAULT NULL,
  `tax` FLOAT NULL DEFAULT NULL,
  `total` FLOAT NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `sales_status` ENUM('INITIATED', 'LOADING ORDER', 'PACKING LIST', 'INVOICE') NOT NULL DEFAULT 'INITIATED',
  PRIMARY KEY (`so_loading_order_id`),
  INDEX `sales_orders_id` (`sales_orders_id` ASC) VISIBLE,
  CONSTRAINT `so_loading_order_ibfk_1`
    FOREIGN KEY (`sales_orders_id`)
    REFERENCES `sales_orders` (`sales_orders_id`));



-- -----------------------------------------------------
-- Table `account_transaction`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `account_transaction` (
  `account_transaction_id` INT NOT NULL AUTO_INCREMENT,
  `po_supplier_invoice_mapper_id` INT NULL DEFAULT NULL,
  `purchase_order_id` INT NULL DEFAULT NULL,
  `supplier_id` INT NULL DEFAULT NULL,
  `so_loading_order_id` INT NULL DEFAULT NULL,
  `so` INT NULL DEFAULT NULL,
  `transaction_of` ENUM('sales', 'purchase') NOT NULL,
  `transaction_amount` FLOAT NULL DEFAULT NULL,
  `transaction_amount_date` DATE NULL DEFAULT NULL,
  `transaction_amount_type` ENUM('debit', 'credit') NOT NULL,
  `accounts_id` INT NOT NULL,
  `entry_type` ENUM('dr', 'cr') NOT NULL,
  `payment_method` VARCHAR(50) NULL DEFAULT NULL,
  `check` INT NULL DEFAULT NULL,
  `address` VARCHAR(255) NULL DEFAULT NULL,
  `suite` VARCHAR(255) NULL DEFAULT NULL,
  `city` VARCHAR(255) NULL DEFAULT NULL,
  `state` VARCHAR(255) NULL DEFAULT NULL,
  `zip` INT NULL DEFAULT NULL,
  `memo` VARCHAR(255) NULL DEFAULT NULL,
  `miscellaneous` VARCHAR(255) NULL DEFAULT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `amount` FLOAT NULL DEFAULT NULL,
  `amountOn_check` FLOAT NULL DEFAULT NULL,
  `amount_applied` FLOAT NULL DEFAULT NULL,
  `unapplied_balance` FLOAT NULL DEFAULT NULL,
  `internal_notes` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `customer_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`account_transaction_id`),
  INDEX `po_supplier_invoice_mapper_id` (`po_supplier_invoice_mapper_id` ASC) VISIBLE,
  INDEX `purchase_order_id` (`purchase_order_id` ASC) VISIBLE,
  INDEX `accounts_id` (`accounts_id` ASC) VISIBLE,
  INDEX `supplier_id` (`supplier_id` ASC) VISIBLE,
  INDEX `so_loading_order_id` (`so_loading_order_id` ASC) VISIBLE,
  INDEX `so` (`so` ASC) VISIBLE,
  INDEX `customer_id` (`customer_id` ASC) VISIBLE,
  CONSTRAINT `account_transaction_ibfk_1`
    FOREIGN KEY (`po_supplier_invoice_mapper_id`)
    REFERENCES `po_supplier_invoice_mapper` (`po_supplier_invoice_mapper_id`),
  CONSTRAINT `account_transaction_ibfk_2`
    FOREIGN KEY (`purchase_order_id`)
    REFERENCES `purchase_orders` (`purchase_order_id`),
  CONSTRAINT `account_transaction_ibfk_3`
    FOREIGN KEY (`accounts_id`)
    REFERENCES `accounts` (`accounts_id`),
  CONSTRAINT `account_transaction_ibfk_4`
    FOREIGN KEY (`supplier_id`)
    REFERENCES `suppliers` (`supplier_id`),
  CONSTRAINT `account_transaction_ibfk_5`
    FOREIGN KEY (`so_loading_order_id`)
    REFERENCES `so_loading_order` (`so_loading_order_id`),
  CONSTRAINT `account_transaction_ibfk_6`
    FOREIGN KEY (`so`)
    REFERENCES `sales_orders` (`so`),
  CONSTRAINT `account_transaction_ibfk_7`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`customer_id`));



-- -----------------------------------------------------
-- Table `container`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `container` (
  `container_id` INT NOT NULL AUTO_INCREMENT,
  `po_supplier_invoice_mapper_id` INT NOT NULL,
  `container_number` FLOAT NOT NULL,
  `received_on` DATETIME NULL DEFAULT NULL,
  `received_by` VARCHAR(255) NOT NULL,
  `notes` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`container_id`),
  INDEX `po_supplier_invoice_mapper_id` (`po_supplier_invoice_mapper_id` ASC) VISIBLE,
  CONSTRAINT `container_ibfk_1`
    FOREIGN KEY (`po_supplier_invoice_mapper_id`)
    REFERENCES `po_supplier_invoice_mapper` (`po_supplier_invoice_mapper_id`));


-- -----------------------------------------------------
-- Table `products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` INT NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(255) NOT NULL,
  `type` ENUM('Slab', 'Pavers', 'Bench', 'Table', 'Sink', 'Mirror') NOT NULL,
  `base_color` ENUM('Black', 'Beige', 'Blue', 'Dark Blue', 'Brown', 'Pink', 'Gold', 'Gray', 'Crimson', 'Red', 'Dark Red', 'Mute Red', 'White', 'Yellow', 'Green', 'Sea Green', 'Mute sea green', 'light Green') NULL DEFAULT NULL,
  `origin` ENUM('Vietnam', 'Angola', 'Brazil', 'Canada', 'China', 'Greece', 'India', 'Italy', 'Norway', 'Saudi Arabia', 'South Africa', 'Spain', 'Ukraine') NULL DEFAULT NULL,
  `category` ENUM('GRANITE', 'LIMESTONE', 'MARBLE', 'QUARTZ', 'QUARTZITE', 'SOAPSTONE') NULL DEFAULT NULL,
  `alternative_name` VARCHAR(255) NULL DEFAULT NULL,
  `kind` ENUM('Stock', 'Non-stock') NOT NULL,
  `sub_category` VARCHAR(255) NULL DEFAULT NULL,
  `groups_all` VARCHAR(255) NULL DEFAULT NULL,
  `finish` VARCHAR(255) NULL DEFAULT NULL,
  `thickness` VARCHAR(255) NULL DEFAULT NULL,
  `serial_name` VARCHAR(255) NULL DEFAULT NULL,
  `uom_group` ENUM('lb', 'in', 'CF', 'CM', 'SF', 'Kg', 'SQM', 'CBM', 'EA') NOT NULL,
  `weight` VARCHAR(255) NULL DEFAULT NULL,
  `single_slab` VARCHAR(255) NOT NULL,
  `bundle` VARCHAR(255) NULL DEFAULT NULL,
  `price_range` ENUM('low', 'mid', 'high', 'very high') NULL DEFAULT NULL,
  `gl_inventory_link_account` VARCHAR(255) NULL DEFAULT NULL,
  `gl_income_account` VARCHAR(255) NULL DEFAULT NULL,
  `gl_cost_goods_account` VARCHAR(255) NULL DEFAULT NULL,
  `safety_stock` VARCHAR(255) NULL DEFAULT NULL,
  `reorder_quantity` VARCHAR(255) NULL DEFAULT NULL,
  `lead_time` VARCHAR(255) NULL DEFAULT NULL,
  `assigned_time` ENUM('A1', 'A2', 'A3', 'B1', 'B2', 'B3') NULL DEFAULT NULL,
  `preferred_supplier` VARCHAR(255) NULL DEFAULT NULL,
  `manufacture` VARCHAR(255) NULL DEFAULT NULL,
  `purchase_unit` VARCHAR(255) NULL DEFAULT NULL,
  `quantity` VARCHAR(255) NULL DEFAULT NULL,
  `supplier_product` VARCHAR(255) NULL DEFAULT NULL,
  `supplier_sku` VARCHAR(255) NULL DEFAULT NULL,
  `avr_estimate_cost` VARCHAR(255) NULL DEFAULT NULL,
  `notes` VARCHAR(255) NULL DEFAULT NULL,
  `instructions` VARCHAR(255) NULL DEFAULT NULL,
  `disclaimer` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_by` INT NULL DEFAULT NULL,
  `updated_by` INT NULL DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE INDEX `product_name` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_2` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_3` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_4` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_5` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_6` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_7` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_8` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_9` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_10` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_11` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_12` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_13` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_14` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_15` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_16` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_17` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_18` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_19` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_20` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_21` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_22` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_23` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_24` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_25` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_26` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_27` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_28` (`product_name` ASC) VISIBLE,
  UNIQUE INDEX `product_name_29` (`product_name` ASC) VISIBLE);



-- -----------------------------------------------------
-- Table `product_inventory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_inventory` (
  `product_inventory_id` INT NOT NULL AUTO_INCREMENT,
  `product_id` INT NOT NULL,
  `slab_in_stock` FLOAT NULL DEFAULT NULL,
  `quantity_in_stock` FLOAT NULL DEFAULT NULL,
  `slab_available` ENUM('Available') NOT NULL DEFAULT 'Available',
  `quantity_available` ENUM('Available') NOT NULL DEFAULT 'Available',
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`product_inventory_id`),
  INDEX `product_id` (`product_id` ASC) VISIBLE,
  CONSTRAINT `product_inventory_ibfk_1`
    FOREIGN KEY (`product_id`)
    REFERENCES `products` (`product_id`));



-- -----------------------------------------------------
-- Table `purchase_order_products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_order_products` (
  `purchase_order_product_id` INT NOT NULL AUTO_INCREMENT,
  `purchase_order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`purchase_order_product_id`),
  INDEX `purchase_order_id` (`purchase_order_id` ASC) VISIBLE,
  INDEX `product_id` (`product_id` ASC) VISIBLE,
  CONSTRAINT `purchase_order_products_ibfk_1`
    FOREIGN KEY (`purchase_order_id`)
    REFERENCES `purchase_orders` (`purchase_order_id`),
  CONSTRAINT `purchase_order_products_ibfk_2`
    FOREIGN KEY (`product_id`)
    REFERENCES `products` (`product_id`));



-- -----------------------------------------------------
-- Table `po_supplier_invoices`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `po_supplier_invoices` (
  `po_supplier_invoice_id` INT NOT NULL AUTO_INCREMENT,
  `po_supplier_invoice_mapper_id` INT NOT NULL,
  `purchase_order_product_id` INT NOT NULL,
  `product_sku` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `supplier_notes` VARCHAR(255) NULL DEFAULT NULL,
  `slab` INT NULL DEFAULT NULL,
  `sqm` FLOAT NULL DEFAULT NULL,
  `uom` FLOAT NULL DEFAULT NULL,
  `quantity` FLOAT NULL DEFAULT NULL,
  `unit_price` FLOAT NULL DEFAULT NULL,
  `total_per_unit` FLOAT NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`po_supplier_invoice_id`),
  INDEX `po_supplier_invoice_mapper_id` (`po_supplier_invoice_mapper_id` ASC) VISIBLE,
  INDEX `purchase_order_product_id` (`purchase_order_product_id` ASC) VISIBLE,
  CONSTRAINT `po_supplier_invoices_ibfk_1`
    FOREIGN KEY (`po_supplier_invoice_mapper_id`)
    REFERENCES `po_supplier_invoice_mapper` (`po_supplier_invoice_mapper_id`),
  CONSTRAINT `po_supplier_invoices_ibfk_2`
    FOREIGN KEY (`purchase_order_product_id`)
    REFERENCES `purchase_order_products` (`purchase_order_product_id`));



-- -----------------------------------------------------
-- Table `inventory_invoice_mapper`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `inventory_invoice_mapper` (
  `inventory_invoice_mapper_id` INT NOT NULL AUTO_INCREMENT,
  `product_inventory_id` INT NULL DEFAULT NULL,
  `po_supplier_invoice_id` INT NULL DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`inventory_invoice_mapper_id`),
  INDEX `product_inventory_id` (`product_inventory_id` ASC) VISIBLE,
  INDEX `po_supplier_invoice_id` (`po_supplier_invoice_id` ASC) VISIBLE,
  CONSTRAINT `inventory_invoice_mapper_ibfk_1`
    FOREIGN KEY (`product_inventory_id`)
    REFERENCES `product_inventory` (`product_inventory_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `inventory_invoice_mapper_ibfk_2`
    FOREIGN KEY (`po_supplier_invoice_id`)
    REFERENCES `po_supplier_invoices` (`po_supplier_invoice_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE);



-- -----------------------------------------------------
-- Table `permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `permissions` (
  `permission_id` INT NOT NULL AUTO_INCREMENT,
  `permission_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL DEFAULT NULL,
  `module` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`permission_id`),
  UNIQUE INDEX `permission_name` (`permission_name` ASC) VISIBLE);



-- -----------------------------------------------------
-- Table `po_slab_details`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `po_slab_details` (
  `po_slab_detail_id` INT NOT NULL AUTO_INCREMENT,
  `po_supplier_invoice_id` INT NOT NULL,
  `po_supplier_invoice_mapper_id` INT NOT NULL,
  `serial_number` VARCHAR(255) NOT NULL,
  `entry_unit` VARCHAR(255) NULL DEFAULT NULL,
  `package_length` FLOAT NULL DEFAULT NULL,
  `package_width` FLOAT NULL DEFAULT NULL,
  `receving_length` FLOAT NULL DEFAULT NULL,
  `receving_width` FLOAT NULL DEFAULT NULL,
  `block` INT NULL DEFAULT NULL,
  `lot` INT NULL DEFAULT NULL,
  `slab` INT NULL DEFAULT NULL,
  `bin` ENUM('A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6') NOT NULL,
  `notes` VARCHAR(255) NULL DEFAULT NULL,
  `slab_counter` INT NOT NULL,
  `barcode` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`po_slab_detail_id`),
  INDEX `po_supplier_invoice_id` (`po_supplier_invoice_id` ASC) VISIBLE,
  INDEX `po_supplier_invoice_mapper_id` (`po_supplier_invoice_mapper_id` ASC) VISIBLE,
  CONSTRAINT `po_slab_details_ibfk_1`
    FOREIGN KEY (`po_supplier_invoice_id`)
    REFERENCES `po_supplier_invoices` (`po_supplier_invoice_id`),
  CONSTRAINT `po_slab_details_ibfk_2`
    FOREIGN KEY (`po_supplier_invoice_mapper_id`)
    REFERENCES `po_supplier_invoice_mapper` (`po_supplier_invoice_mapper_id`));



-- -----------------------------------------------------
-- Table `pre_purchase_orders`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `pre_purchase_orders` (
  `pre_purchase_order_id` INT NOT NULL AUTO_INCREMENT,
  `purchase_order_product_id` INT NOT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `supplier_note` VARCHAR(255) NULL DEFAULT NULL,
  `purchase_quantity` INT NULL DEFAULT NULL,
  `purchase_uom` VARCHAR(255) NULL DEFAULT NULL,
  `unit_price` FLOAT NULL DEFAULT NULL,
  `minimum_length` FLOAT NULL DEFAULT NULL,
  `minimum_width` FLOAT NULL DEFAULT NULL,
  `bundles` INT NULL DEFAULT NULL,
  `slab_bundles` INT NULL DEFAULT NULL,
  `slabs` INT NULL DEFAULT NULL,
  `quantity` INT NULL DEFAULT NULL,
  `final_unit_price` FLOAT NULL DEFAULT NULL,
  `total_price` FLOAT NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`pre_purchase_order_id`),
  INDEX `purchase_order_product_id` (`purchase_order_product_id` ASC) VISIBLE,
  CONSTRAINT `pre_purchase_orders_ibfk_1`
    FOREIGN KEY (`purchase_order_product_id`)
    REFERENCES `purchase_order_products` (`purchase_order_product_id`));



-- -----------------------------------------------------
-- Table `purchase_payment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_payment` (
  `purchase_payment_id` INT NOT NULL AUTO_INCREMENT,
  `po_supplier_invoice_mapper_id` INT NULL DEFAULT NULL,
  `supplier_id` INT NOT NULL,
  `cash_account` VARCHAR(255) NOT NULL,
  `payment_date` DATETIME NULL DEFAULT NULL,
  `payment_method` ENUM('Cash', 'Check', 'Debit Card', 'CC-Amex', 'CC-Master', 'CC-Visa', 'CC-Discover', 'Wire', 'ACH', 'AutoPay', 'Other') NOT NULL,
  `check` INT NULL DEFAULT NULL,
  `date_on_check` DATETIME NULL DEFAULT NULL,
  `address` VARCHAR(255) NULL DEFAULT NULL,
  `suite` VARCHAR(255) NULL DEFAULT NULL,
  `city` VARCHAR(255) NULL DEFAULT NULL,
  `state` VARCHAR(255) NULL DEFAULT NULL,
  `zip` INT NULL DEFAULT NULL,
  `memo` VARCHAR(255) NULL DEFAULT NULL,
  `miscellaneous` VARCHAR(255) NULL DEFAULT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `amount` FLOAT NULL DEFAULT NULL,
  `amountOn_check` FLOAT NOT NULL,
  `amount_applied` FLOAT NOT NULL,
  `unapplied_balance` FLOAT NOT NULL,
  `internal_notes` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`purchase_payment_id`),
  INDEX `po_supplier_invoice_mapper_id` (`po_supplier_invoice_mapper_id` ASC) VISIBLE,
  INDEX `supplier_id` (`supplier_id` ASC) VISIBLE,
  CONSTRAINT `purchase_payment_ibfk_1`
    FOREIGN KEY (`po_supplier_invoice_mapper_id`)
    REFERENCES `po_supplier_invoice_mapper` (`po_supplier_invoice_mapper_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `purchase_payment_ibfk_2`
    FOREIGN KEY (`supplier_id`)
    REFERENCES `suppliers` (`supplier_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `role_id` INT NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(255) NOT NULL,
  `role_description` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  UNIQUE INDEX `role_name` (`role_name` ASC) VISIBLE);



-- -----------------------------------------------------
-- Table `role_permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_permission_id` INT NOT NULL AUTO_INCREMENT,
  `role_id` INT NULL DEFAULT NULL,
  `permission_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`role_permission_id`),
  INDEX `role_id` (`role_id` ASC) VISIBLE,
  INDEX `permission_id` (`permission_id` ASC) VISIBLE,
  CONSTRAINT `role_permissions_ibfk_1`
    FOREIGN KEY (`role_id`)
    REFERENCES `roles` (`role_id`),
  CONSTRAINT `role_permissions_ibfk_2`
    FOREIGN KEY (`permission_id`)
    REFERENCES `permissions` (`permission_id`));



-- -----------------------------------------------------
-- Table `sales_account`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales_account` (
  `sales_account_id` INT NOT NULL AUTO_INCREMENT,
  `so_loading_order_id` INT NULL DEFAULT NULL,
  `sales_orders_id` INT NULL DEFAULT NULL,
  `debit_amount` INT NULL DEFAULT NULL,
  `debit_amount_date` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`sales_account_id`),
  INDEX `so_loading_order_id` (`so_loading_order_id` ASC) VISIBLE,
  INDEX `sales_orders_id` (`sales_orders_id` ASC) VISIBLE,
  CONSTRAINT `sales_account_ibfk_1`
    FOREIGN KEY (`so_loading_order_id`)
    REFERENCES `so_loading_order` (`so_loading_order_id`),
  CONSTRAINT `sales_account_ibfk_2`
    FOREIGN KEY (`sales_orders_id`)
    REFERENCES `sales_orders` (`sales_orders_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `sales_account_transaction`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales_account_transaction` (
  `sales_account_id` INT NOT NULL AUTO_INCREMENT,
  `so_loading_order_id` INT NOT NULL,
  `so` INT NULL DEFAULT NULL,
  `debit_amount` INT NULL DEFAULT NULL,
  `debit_amount_date` DATE NULL DEFAULT NULL,
  `credit_amount` INT NULL DEFAULT NULL,
  `credit_amount_date` DATE NULL DEFAULT NULL,
  `transaction_type` ENUM('debit', 'credit') NOT NULL,
  `accounts_id` INT NOT NULL,
  `entry_type` ENUM('dr', 'cr') NOT NULL,
  PRIMARY KEY (`sales_account_id`),
  INDEX `so_loading_order_id` (`so_loading_order_id` ASC) VISIBLE,
  INDEX `so` (`so` ASC) VISIBLE,
  INDEX `accounts_id` (`accounts_id` ASC) VISIBLE,
  CONSTRAINT `sales_account_transaction_ibfk_1`
    FOREIGN KEY (`so_loading_order_id`)
    REFERENCES `so_loading_order` (`so_loading_order_id`),
  CONSTRAINT `sales_account_transaction_ibfk_2`
    FOREIGN KEY (`so`)
    REFERENCES `sales_orders` (`so`),
  CONSTRAINT `sales_account_transaction_ibfk_3`
    FOREIGN KEY (`accounts_id`)
    REFERENCES `accounts` (`accounts_id`));



-- -----------------------------------------------------
-- Table `sales_credit_transactions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales_credit_transactions` (
  `sales_credit_transaction_id` INT NOT NULL AUTO_INCREMENT,
  `sales_account_id` INT NULL DEFAULT NULL,
  `credit_amount` INT NULL DEFAULT NULL,
  `credit_amount_date` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`sales_credit_transaction_id`),
  INDEX `sales_account_id` (`sales_account_id` ASC) VISIBLE,
  CONSTRAINT `sales_credit_transactions_ibfk_1`
    FOREIGN KEY (`sales_account_id`)
    REFERENCES `sales_account` (`sales_account_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `sales_orders_inventory`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales_orders_inventory` (
  `sales_orders_inventory_id` INT NOT NULL AUTO_INCREMENT,
  `sales_orders_id` INT NOT NULL,
  `product_inventory_id` INT NOT NULL,
  `po_slab_detail_id` INT NOT NULL,
  `so_loading_order_id` INT NULL DEFAULT NULL,
  `unit_price` FLOAT NULL DEFAULT NULL,
  `sales_status` ENUM('INITIATED', 'LOADING ORDER', 'PACKING LIST', 'INVOICE') NOT NULL DEFAULT 'INITIATED',
  `remeasure_length` FLOAT NULL DEFAULT NULL,
  `remeasure_width` FLOAT NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`sales_orders_inventory_id`),
  INDEX `sales_orders_id` (`sales_orders_id` ASC) VISIBLE,
  INDEX `product_inventory_id` (`product_inventory_id` ASC) VISIBLE,
  INDEX `po_slab_detail_id` (`po_slab_detail_id` ASC) VISIBLE,
  INDEX `so_loading_order_id` (`so_loading_order_id` ASC) VISIBLE,
  CONSTRAINT `sales_orders_inventory_ibfk_1`
    FOREIGN KEY (`sales_orders_id`)
    REFERENCES `sales_orders` (`sales_orders_id`),
  CONSTRAINT `sales_orders_inventory_ibfk_2`
    FOREIGN KEY (`product_inventory_id`)
    REFERENCES `product_inventory` (`product_inventory_id`),
  CONSTRAINT `sales_orders_inventory_ibfk_3`
    FOREIGN KEY (`po_slab_detail_id`)
    REFERENCES `po_slab_details` (`po_slab_detail_id`),
  CONSTRAINT `sales_orders_inventory_ibfk_4`
    FOREIGN KEY (`so_loading_order_id`)
    REFERENCES `so_loading_order` (`so_loading_order_id`));



-- -----------------------------------------------------
-- Table `sales_payment`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `sales_payment` (
  `sales_payment_id` INT NOT NULL AUTO_INCREMENT,
  `so_loading_order_id` INT NOT NULL,
  `sales_orders_id` INT NOT NULL,
  `cash_account` VARCHAR(255) NOT NULL,
  `payment_date` DATE NULL DEFAULT NULL,
  `payment_method` ENUM('Cash', 'Check', 'Debit Card', 'CC-Amex', 'CC-Master', 'CC-Visa', 'CC-Discover', 'Wire', 'ACH', 'AutoPay', 'Other') NOT NULL,
  `check` INT NULL DEFAULT NULL,
  `date_on_check` DATE NULL DEFAULT NULL,
  `address` VARCHAR(255) NULL DEFAULT NULL,
  `suite` VARCHAR(255) NULL DEFAULT NULL,
  `city` VARCHAR(255) NULL DEFAULT NULL,
  `state` VARCHAR(255) NULL DEFAULT NULL,
  `zip` INT NULL DEFAULT NULL,
  `memo` VARCHAR(255) NULL DEFAULT NULL,
  `miscellaneous` VARCHAR(255) NULL DEFAULT NULL,
  `description` VARCHAR(255) NULL DEFAULT NULL,
  `amount` FLOAT NULL DEFAULT NULL,
  `amountOn_check` FLOAT NOT NULL,
  `amount_applied` FLOAT NOT NULL,
  `unapplied_balance` FLOAT NOT NULL,
  `internal_notes` VARCHAR(255) NULL DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`sales_payment_id`),
  INDEX `so_loading_order_id` (`so_loading_order_id` ASC) VISIBLE,
  INDEX `sales_orders_id` (`sales_orders_id` ASC) VISIBLE,
  CONSTRAINT `sales_payment_ibfk_1`
    FOREIGN KEY (`so_loading_order_id`)
    REFERENCES `so_loading_order` (`so_loading_order_id`),
  CONSTRAINT `sales_payment_ibfk_2`
    FOREIGN KEY (`sales_orders_id`)
    REFERENCES `sales_orders` (`sales_orders_id`));



-- -----------------------------------------------------
-- Table `settings`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_id` INT NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(255) NOT NULL,
  `setting_value` JSON NOT NULL,
  `setting_type` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`setting_id`),
  UNIQUE INDEX `setting_key` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_2` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_3` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_4` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_5` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_6` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_7` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_8` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_9` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_10` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_11` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_12` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_13` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_14` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_15` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_16` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_17` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_18` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_19` (`setting_key` ASC) VISIBLE,
  UNIQUE INDEX `setting_key_20` (`setting_key` ASC) VISIBLE);



-- -----------------------------------------------------
-- Table `users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `userid` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `userid` (`userid` ASC) VISIBLE);



-- -----------------------------------------------------
-- Table `user_roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_role_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NULL DEFAULT NULL,
  `role_id` INT NULL DEFAULT NULL,
  PRIMARY KEY (`user_role_id`),
  INDEX `user_id` (`user_id` ASC) VISIBLE,
  INDEX `role_id` (`role_id` ASC) VISIBLE,
  CONSTRAINT `user_roles_ibfk_1`
    FOREIGN KEY (`user_id`)
    REFERENCES `users` (`id`),
  CONSTRAINT `user_roles_ibfk_2`
    FOREIGN KEY (`role_id`)
    REFERENCES `roles` (`role_id`));


USE `stone_design` ;

-- -----------------------------------------------------
-- procedure update_coa_codes
-- -----------------------------------------------------

DELIMITER $$
USE `stone_design`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_coa_codes`()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE var_account_id INT;
    DECLARE var_account_types_id INT;
    DECLARE var_sub_account_types_id INT;
    DECLARE var_coa_code VARCHAR(6);
    
    DECLARE account_cursor CURSOR FOR
    SELECT accounts_id, account_types_id, sub_account_types_id
    FROM accounts;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN account_cursor;

    read_loop: LOOP
        FETCH account_cursor INTO var_account_id, var_account_types_id, var_sub_account_types_id;
        
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        SET var_coa_code = CONCAT(
            LPAD(var_account_types_id, 2, '0'),
            LPAD(var_sub_account_types_id, 2, '0'),
            LPAD(var_account_id, 2, '0')
        );

        UPDATE accounts
        SET coa_code = var_coa_code
        WHERE accounts_id = var_account_id;
    END LOOP;

    CLOSE account_cursor;
END$$

DELIMITER ;

-- -----------------------------------------------------
-- procedure update_coa_codes_one_by_one
-- -----------------------------------------------------

DELIMITER $$
USE `stone_design`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `update_coa_codes_one_by_one`()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE var_account_id INT;
    DECLARE var_account_types_id INT;
    DECLARE var_sub_account_types_id INT;
    DECLARE var_coa_code VARCHAR(12);
    DECLARE var_row_number INT;

    DECLARE account_cursor CURSOR FOR
    SELECT accounts_id, account_types_id, sub_account_types_id
    FROM accounts;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN account_cursor;

    read_loop: LOOP
        FETCH account_cursor INTO var_account_id, var_account_types_id, var_sub_account_types_id;

        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Initialize the row number variable
        SET @row_number := 0;
        
        -- Compute the row number for sub_account_types_id within its account_types_id group
        SELECT row_num
        INTO var_row_number
        FROM (
            SELECT sub_account_types_id, 
                   (@row_number := @row_number + 1) AS row_num
            FROM sub_account_types
            WHERE account_types_id = var_account_types_id
            ORDER BY sub_account_types_id
        ) AS sub_accounts
        WHERE sub_account_types_id = var_sub_account_types_id;

        -- Construct the coa_code
        SET var_coa_code = CONCAT(
            LPAD(CAST(var_account_types_id AS CHAR), 2, '0'),
            LPAD(CAST(var_row_number AS CHAR), 2, '0'),
            LPAD(CAST(var_account_id AS CHAR), 4, '0')
        );

        -- Update the accounts table with the generated coa_code
        UPDATE accounts
        SET coa_code = var_coa_code
        WHERE accounts_id = var_account_id;
    END LOOP;

    CLOSE account_cursor;
END$$

DELIMITER ;
