"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("sales_orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      clientSoNumber: {
        type: Sequelize.INTEGER,
        allowNull: true, // Auto-Incremented and not null is handled in hook
      },
      soDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      customerPo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("open", "completed", "cancelled", "closed"),
        allowNull: false,
        defaultValue: "open",
      },
      deliveryType: {
        type: Sequelize.ENUM("pickup", "delivery"),
        allowNull: false,
      },
      deliveryNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paymentTerms: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customerPoDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      expDeliveryDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      shippingAddressId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "customer_addresses",
          key: "id",
        },
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
      soLocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "locations",
          key: "id",
        },
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
    await queryInterface.dropTable("sales_orders");
  },
};
