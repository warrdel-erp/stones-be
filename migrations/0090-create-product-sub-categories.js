"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.createTable("product_sub_categories", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "clients",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      isSlabType: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Composite unique constraint
    await queryInterface.addConstraint("product_sub_categories", {
      fields: ["name", "clientId"],
      type: "unique",
      name: "unique_name_clientId_product_sub_categories",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("product_sub_categories");
  },
};