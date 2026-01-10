"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add clientId to products
    await queryInterface.addColumn("products", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to product_base_colors
    await queryInterface.addColumn("product_base_colors", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to product_groups
    await queryInterface.addColumn("product_groups", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to advanced_deposits
    await queryInterface.addColumn("advanced_deposits", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to advanced_deposit_settlements
    await queryInterface.addColumn("advanced_deposit_settlements", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to bill_items
    await queryInterface.addColumn("bill_items", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to bins
    await queryInterface.addColumn("bins", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to customer_addresses
    await queryInterface.addColumn("customer_addresses", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to generic_products
    await queryInterface.addColumn("generic_products", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to inventory_product_holds
    await queryInterface.addColumn("inventory_product_holds", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to journal_entries
    await queryInterface.addColumn("journal_entries", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to notes
    await queryInterface.addColumn("notes", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to payment_bills
    await queryInterface.addColumn("payment_bills", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to requested_purchase_products
    await queryInterface.addColumn("requested_purchase_products", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to return_products
    await queryInterface.addColumn("return_products", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to sales_order_products
    await queryInterface.addColumn("sales_order_products", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to services
    await queryInterface.addColumn("services", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to sipl_products
    await queryInterface.addColumn("sipl_products", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to slab_remeasurements
    await queryInterface.addColumn("slab_remeasurements", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to so_product_swap_histories
    await queryInterface.addColumn("so_product_swap_histories", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to warehouses
    await queryInterface.addColumn("warehouses", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to freight_details
    await queryInterface.addColumn("freight_details", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add clientId to invoice_deliveries
    await queryInterface.addColumn("invoice_deliveries", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("products", "clientId");
    await queryInterface.removeColumn("product_base_colors", "clientId");
    await queryInterface.removeColumn("product_groups", "clientId");
    await queryInterface.removeColumn("advanced_deposits", "clientId");
    await queryInterface.removeColumn("advanced_deposit_settlements", "clientId");
    await queryInterface.removeColumn("bill_items", "clientId");
    await queryInterface.removeColumn("bins", "clientId");
    await queryInterface.removeColumn("customer_addresses", "clientId");
    await queryInterface.removeColumn("generic_products", "clientId");
    await queryInterface.removeColumn("inventory_product_holds", "clientId");
    await queryInterface.removeColumn("journal_entries", "clientId");
    await queryInterface.removeColumn("notes", "clientId");
    await queryInterface.removeColumn("payment_bills", "clientId");
    await queryInterface.removeColumn("requested_purchase_products", "clientId");
    await queryInterface.removeColumn("return_products", "clientId");
    await queryInterface.removeColumn("sales_order_products", "clientId");
    await queryInterface.removeColumn("services", "clientId");
    await queryInterface.removeColumn("sipl_products", "clientId");
    await queryInterface.removeColumn("slab_remeasurements", "clientId");
    await queryInterface.removeColumn("so_product_swap_histories", "clientId");
    await queryInterface.removeColumn("warehouses", "clientId");
    await queryInterface.removeColumn("freight_details", "clientId");
    await queryInterface.removeColumn("invoice_deliveries", "clientId");
  },
};
