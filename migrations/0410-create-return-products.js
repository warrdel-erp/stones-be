"use strict";

module.exports = {
  up: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.createTable("return_products", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      salesOrderProductId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "sales_order_products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      returnId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "returns",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
  down: async (sequelizeInterface, Sequelize) => {
    await sequelizeInterface.dropTable("return_products");
  },
};
