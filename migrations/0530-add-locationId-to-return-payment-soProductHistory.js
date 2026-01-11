"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add locationId to returns
    await queryInterface.addColumn("returns", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to return_products
    await queryInterface.addColumn("return_products", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to so_product_swap_histories
    await queryInterface.addColumn("so_product_swap_histories", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to payments
    await queryInterface.addColumn("payments", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "locations",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Add locationId to payment_bills
    await queryInterface.addColumn("payment_bills", "locationId", {
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
    await queryInterface.removeColumn("payment_bills", "locationId");
    await queryInterface.removeColumn("payments", "locationId");
    await queryInterface.removeColumn("so_product_swap_histories", "locationId");
    await queryInterface.removeColumn("return_products", "locationId");
    await queryInterface.removeColumn("returns", "locationId");
  },
};
