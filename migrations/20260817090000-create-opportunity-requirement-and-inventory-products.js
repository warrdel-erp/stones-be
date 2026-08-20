"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes("opportunity_requirement_products")) {
      await queryInterface.createTable("opportunity_requirement_products", {
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
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "products",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        unitType: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: "slabs",
        },
        requiredCount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
        },
        allocatedCount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0,
        },
        status: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: "PENDING",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      });
    }

    if (!tables.includes("opportunity_inventory_products")) {
      await queryInterface.createTable("opportunity_inventory_products", {
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
        requirementProductId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "opportunity_requirement_products",
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
        status: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: "RESERVED",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("opportunity_inventory_products");
    await queryInterface.dropTable("opportunity_requirement_products");
  },
};
