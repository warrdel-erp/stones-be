"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("sales_order_products", "receivingAreaSqIn", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("sales_order_products", "receivingAreaSqIn");
  },
};
