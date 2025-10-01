"use strict";

module.exports = {
  up: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.createTable("freight_details", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      vessel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      airBill: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      plannedExFactoryDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      exFactoryDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      departurePort: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      etdPort: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      arrivalPort: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      etaPort: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dischargePort: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      wiringInstruction: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      freightForwarderId: {
        type: Sequelize.INTEGER,
        // allowNull: false,
        references: {
          model: "vendors",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      siplId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "sipls",
          key: "id",
        },
        onUpdate: "CASCADE",
      },
      purchaseOrderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "purchase_orders",
          key: "id",
        },
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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  down: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.dropTable("freight_details");
  },
};
