"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("sales_order_products", "receivingAreaSqIn", "receivingAreaSqFt");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("sales_order_products", "receivingAreaSqFt", "receivingAreaSqIn");
  },
};
