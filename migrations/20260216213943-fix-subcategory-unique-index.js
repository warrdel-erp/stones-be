"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Old unique index on name remove
    await queryInterface.removeIndex(
      "product_sub_categories",
      "name"
    );

    // Add composite unique constraint (name + clientId)
    await queryInterface.addConstraint("product_sub_categories", {
      fields: ["name", "clientId"],
      type: "unique",
      name: "unique_name_clientId_product_sub_categories",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove composite constraint
    await queryInterface.removeConstraint(
      "product_sub_categories",
      "unique_name_clientId_product_sub_categories"
    );

    // Re-add old unique on name (rollback case)
    await queryInterface.addConstraint("product_sub_categories", {
      fields: ["name"],
      type: "unique",
      name: "name",
    });
  },
};