"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const indexes = await queryInterface.showIndex("inventory_products");
    const uniqueIndex = indexes.find(
      (idx) =>
        idx.unique &&
        idx.fields.length === 1 &&
        (idx.fields[0].attribute === "combinedNumber" || idx.fields[0].column === "combinedNumber")
    );

    if (uniqueIndex) {
      await queryInterface.removeIndex("inventory_products", uniqueIndex.name);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex("inventory_products", ["combinedNumber"], {
      unique: true,
      name: "combinedNumber",
    });
  },
};
