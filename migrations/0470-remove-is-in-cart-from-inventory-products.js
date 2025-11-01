"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.removeColumn("inventory_products", "isInCart");
  },
  down: async (queryInterface) => {
    await queryInterface.addColumn("inventory_products", "isInCart", {
      type: queryInterface.BOOLEAN,
      defaultValue: false,
    });
  },
};
