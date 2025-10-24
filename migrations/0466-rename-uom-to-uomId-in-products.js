"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename uom to uomId
    await queryInterface.renameColumn("products", "uom", "uomId");
  },

  async down(queryInterface, Sequelize) {
    // Rename back to uom
    await queryInterface.renameColumn("products", "uomId", "uom");
  },
};

