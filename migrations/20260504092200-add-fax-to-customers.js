"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("customers", "fax", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "landlineNumber",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("customers", "fax");
  },
};
