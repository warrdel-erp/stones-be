"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const table = await queryInterface.describeTable("holds");

    if (!table.opportunityId) {
      await queryInterface.addColumn("holds", "opportunityId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "opportunities",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  down: async (queryInterface) => {
    const table = await queryInterface.describeTable("holds");

    if (table.opportunityId) {
      await queryInterface.removeColumn("holds", "opportunityId");
    }
  },
};
