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
        type: Sequelize.STRING,
        allowNull: true,
      },
      soldAs: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sku: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      itemType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lineType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      subCategory: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      group: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      priceRange: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      seriesName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      kind: {
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesPerson1: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      salesPerson2: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      projManager: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      acctType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      acctName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      customerZone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipToPartyName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipToCity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipToState: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipToZip: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      custType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      associates: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      deliveryType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      slabs: {
        type: Sequelize.STRING,
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
