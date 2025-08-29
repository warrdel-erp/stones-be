"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("purchase_orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      poDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      clientPoNumber: {
        type: Sequelize.INTEGER,
        allowNull: true, // Auto-Incremented and not null is handled in hook
      },
      paymentTerm: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("open", "closed", "canceled"),
        defaultValue: "open",
      },
      purchaseLocationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "locations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      shipmentLocationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "locations",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      supplierId: {
        type: Sequelize.INTEGER,
        references: {
          model: "vendors",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      supplierSo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      etaDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      deliveryType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipmentTerms: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      clientId: {
        type: Sequelize.INTEGER,
        references: {
          model: "clients",
          key: "id",
        },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("purchase_orders");
  },
};
