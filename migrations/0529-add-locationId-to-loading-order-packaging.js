"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add locationId to bills
    await queryInterface.addColumn("loading_orders", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addColumn("packaging_lists", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("loading_orders", "locationId");
    await queryInterface.removeColumn("packaging_lists", "locationId");
  },
};
