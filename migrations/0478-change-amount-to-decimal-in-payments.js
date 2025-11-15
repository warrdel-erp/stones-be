"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change amount from FLOAT to DECIMAL(15,2) in payments
    await queryInterface.changeColumn("payments", "amount", {
      type: Sequelize.DECIMAL(15, 2),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert amount back to FLOAT
    await queryInterface.changeColumn("payments", "amount", {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },
};
