"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add locationId to bills
    await queryInterface.addColumn("bills", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to bill_items
    await queryInterface.addColumn("bill_items", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to slabs
    await queryInterface.addColumn("slabs", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to generic_products
    await queryInterface.addColumn("generic_products", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to inventory_products
    await queryInterface.addColumn("inventory_products", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to bins
    await queryInterface.addColumn("bins", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to cart_items
    await queryInterface.addColumn("cart_items", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to inventory_product_holds
    await queryInterface.addColumn("inventory_product_holds", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to selection_sheets
    await queryInterface.addColumn("selection_sheets", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to selection_sheet_items
    await queryInterface.addColumn("selection_sheet_items", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to advanced_deposit_settlements
    await queryInterface.addColumn("advanced_deposit_settlements", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to deliveries
    await queryInterface.addColumn("deliveries", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove locationId from all tables in reverse order
    await queryInterface.removeColumn("deliveries", "locationId");
    await queryInterface.removeColumn("advanced_deposit_settlements", "locationId");
    await queryInterface.removeColumn("selection_sheet_items", "locationId");
    await queryInterface.removeColumn("selection_sheets", "locationId");
    await queryInterface.removeColumn("inventory_product_holds", "locationId");
    await queryInterface.removeColumn("cart_items", "locationId");
    await queryInterface.removeColumn("bins", "locationId");
    await queryInterface.removeColumn("inventory_products", "locationId");
    await queryInterface.removeColumn("generic_products", "locationId");
    await queryInterface.removeColumn("slabs", "locationId");
    await queryInterface.removeColumn("bill_items", "locationId");
    await queryInterface.removeColumn("bills", "locationId");
  },
};
