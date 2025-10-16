"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("slabs");
    if (table.isHold) {
      await queryInterface.removeColumn("slabs", "isHold");
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("slabs");
    if (!table.isHold) {
      await queryInterface.addColumn("slabs", "isHold", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },
};

