"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn("services", "uom", "uomId");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn("services", "uomId", "uom");
  },
};
