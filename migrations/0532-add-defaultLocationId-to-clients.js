"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("clients", "defaultLocationId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("clients", "defaultLocationId");
  },
};
