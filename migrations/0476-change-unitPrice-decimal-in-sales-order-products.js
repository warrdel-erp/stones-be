"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change unitPrice from DECIMAL(10,3) to DECIMAL(10,2) in sales_order_products
    await queryInterface.changeColumn("sales_order_products", "unitPrice", {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert unitPrice back to DECIMAL(10,3)
    await queryInterface.changeColumn("sales_order_products", "unitPrice", {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: false,
    });
  },
};
