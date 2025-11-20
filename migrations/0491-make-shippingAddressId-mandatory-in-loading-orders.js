"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Make shippingAddressId NOT NULL
    await queryInterface.changeColumn("loading_orders", "shippingAddressId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "customer_addresses",
        key: "id",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert shippingAddressId back to nullable
    await queryInterface.changeColumn("loading_orders", "shippingAddressId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "customer_addresses",
        key: "id",
      },
    });
  },
};
