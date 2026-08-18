"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes("opportunity_quotations")) {
      await queryInterface.createTable("opportunity_quotations", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        clientId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "clients",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        opportunityId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "opportunities",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        quoteNumber: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        version: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1,
        },
        status: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: "DRAFT",
        },
        subtotal: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        taxAmount: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        grandTotal: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
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
    }

    if (!tables.includes("opportunity_quotation_inventory_products")) {
      await queryInterface.createTable("opportunity_quotation_inventory_products", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        clientId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "clients",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        quotationId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "opportunity_quotations",
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
          onDelete: "RESTRICT",
        },
        sellingRate: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        amount: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
        },
        priceSource: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: "Standard",
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
    }
  },

  down: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes("opportunity_quotation_inventory_products")) {
      await queryInterface.dropTable("opportunity_quotation_inventory_products");
    }
    if (tables.includes("opportunity_quotations")) {
      await queryInterface.dropTable("opportunity_quotations");
    }
  },
};
