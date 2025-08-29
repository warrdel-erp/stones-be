"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("advanced_deposits", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      salesOrderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sales_orders",
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
    await queryInterface.dropTable("advanced_deposits");
  },
};
