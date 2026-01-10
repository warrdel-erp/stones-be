"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add locationId to bills
    await queryInterface.addColumn("sales_order_products", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("sales_order_products", "locationId");
  },
};
