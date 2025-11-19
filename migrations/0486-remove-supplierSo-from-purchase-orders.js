"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("purchase_orders", "supplierSo");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("purchase_orders", "supplierSo", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
