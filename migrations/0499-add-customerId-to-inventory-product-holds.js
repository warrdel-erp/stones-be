"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("inventory_product_holds", "customerId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "customers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("inventory_product_holds", "customerId");
  },
};
