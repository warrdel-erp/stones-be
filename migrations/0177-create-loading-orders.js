"use strict";

const DELIVERY_TYPES = {
  PICKUP: "pickup",
  DELIVERY: "delivery",
};

const LOADING_ORDER_STAGES = {
  INITIATED: "initiated",
  PACKAGING_LIST: "packagingList",
  INVOICED: "invoiced",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "loading_orders",
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        code: {
          type: Sequelize.STRING,
        },
        clientLoNumber: {
          type: Sequelize.INTEGER,
          allowNull: true, // Auto-Incremented and not null is handled in hook
        },
        loDate: {
          type: Sequelize.DATEONLY,
          defaultValue: Sequelize.NOW,
          allowNull: false,
        },
        soLoadingOrderNumber: {
          type: Sequelize.INTEGER,
        },
        expDeliveryDate: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        paymentTerms: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        deliveryNotes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        deliveryType: {
          type: Sequelize.ENUM(...Object.values(DELIVERY_TYPES)),
          allowNull: false,
        },
        stage: {
          type: Sequelize.ENUM(...Object.values(LOADING_ORDER_STAGES)),
          defaultValue: LOADING_ORDER_STAGES.INITIATED,
          allowNull: false,
        },
        shippingAddressId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "customer_addresses",
            key: "id",
          },
        },
        salesOrderId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "sales_orders",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
      },
      {
        unique_keys: {
          unique_clientId_clientLoNumber: {
            fields: ["clientId", "clientLoNumber"],
          },
          unique_salesOrderId_soLoadingOrderNumber: {
            fields: ["salesOrderId", "soLoadingOrderNumber"],
          },
        },
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("loading_orders");
  },
};
