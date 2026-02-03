"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("products", ["name", "clientId"], {
      unique: true,
      name: "unique_product_name_per_client",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("products", "unique_product_name_per_client");
  },
};
