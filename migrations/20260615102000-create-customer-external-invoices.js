"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("customer_external_invoices", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "customers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
      item: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      soldAs: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sku: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      itemType: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      lineType: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      subCategory: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      group: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      priceRange: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      seriesName: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      kind: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      transactionNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      invoiceNo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      invoiceDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      jobName: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      location: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      salesPerson1: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      salesPerson2: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      projManager: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      acctType: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      acctName: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      customer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customerZone: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      shipToPartyName: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      shipToCity: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      shipToState: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      shipToZip: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      custType: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      associates: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      deliveryType: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      slabs: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      invQty: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: true,
        defaultValue: 0,
      },
      uom: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      saleTotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      totalCost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      margin: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      marginPercentage: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      tax: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        defaultValue: 0,
      },
      taxRate: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: true,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("customer_external_invoices");
  },
};
