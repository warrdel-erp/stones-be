"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("selection_sheet_items", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      selectionSheetId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "selection_sheets",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      inventoryProductId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "inventory_products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clients",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add unique constraint
    await queryInterface.addIndex("selection_sheet_items", ["selectionSheetId", "inventoryProductId"], {
      unique: true,
      name: "unique_selection_sheet_inventory_product",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("selection_sheet_items");
  },
};

