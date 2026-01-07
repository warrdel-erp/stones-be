"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add isBroken and parentSlabId to slabs table
    await queryInterface.addColumn("slabs", "isBroken", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("slabs", "parentSlabId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "slabs",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Add isBroken to inventory_products table
    await queryInterface.addColumn("inventory_products", "isBroken", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("slabs", "isBroken");
    await queryInterface.removeColumn("slabs", "parentSlabId");
    await queryInterface.removeColumn("inventory_products", "isBroken");
  },
};

