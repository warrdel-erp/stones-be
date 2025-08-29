"use strict";

const BILL_REFERENCE_TYPES = {
  SIPL: "sipl",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("bills", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      invoiceCode: {
        type: Sequelize.STRING,
      },
      siplBillNumber: {
        type: Sequelize.INTEGER,
      },
      invoice: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      invoiceDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      billDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      clientBillNumber: {
        type: Sequelize.INTEGER,
        allowNull: true, // Auto-Incremented and not null is handled in hook
      },
      type: {
        type: Sequelize.ENUM("freight"),
        allowNull: false,
      },
      paymentTerms: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      referenceType: {
        type: Sequelize.ENUM(...Object.values(BILL_REFERENCE_TYPES)), // Could be "sipl" or other types
        allowNull: false,
      },
      referenceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      vendorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "vendors",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "vendors",
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("bills");
  },
};
