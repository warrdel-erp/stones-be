"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.addColumn("sipls", "receivedDate", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `
      UPDATE sipls
      SET receivedDate = CURRENT_DATE()
      WHERE inventoryReceived = true;
      `
    );
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("sipls", "receivedDate");
  },
};
