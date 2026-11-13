"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable("guest_selection_items");

    if (tableDescription.inventoryProductId) {
      await queryInterface.changeColumn("guest_selection_items", "inventoryProductId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "inventory_products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
    }

    if (!tableDescription.productId) {
      await queryInterface.addColumn("guest_selection_items", "productId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
    }

    if (!tableDescription.quantity) {
      await queryInterface.addColumn("guest_selection_items", "quantity", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable("guest_selection_items");

    if (tableDescription.quantity) {
      await queryInterface.removeColumn("guest_selection_items", "quantity");
    }

    if (tableDescription.productId) {
      await queryInterface.removeColumn("guest_selection_items", "productId");
    }

    if (tableDescription.inventoryProductId) {
      await queryInterface.changeColumn("guest_selection_items", "inventoryProductId", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "inventory_products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      });
    }
  },
};

