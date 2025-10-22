"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("sales_order_products", "isSlabType", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Temporary default for migration
    });

    // Remove the default constraint after adding the column
    await queryInterface.changeColumn("sales_order_products", "isSlabType", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("sales_order_products", "isSlabType");
  },
};
