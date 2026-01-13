"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("purchase_orders", "paymentTermId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("purchase_orders", "paymentTermId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
