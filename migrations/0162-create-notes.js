"use strict";

const NOTES_TYPE = {
  INTERNAL: "internal",
  PRINTABLE: "printable",
  DELIVERY: "delivery",
};

const NOTES_REFERENCE_TYPES = {
  SALES_ORDER: "sales_order",
  PURCHASE_ORDER: "purchase_order",
  LOADING_ORDER: "loading_order",
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("notes", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM(...Object.values(NOTES_TYPE)),
        allowNull: false,
      },
      referenceType: {
        type: Sequelize.ENUM(...Object.values(NOTES_REFERENCE_TYPES)),
        allowNull: false,
      },
      referenceId: {
        type: Sequelize.INTEGER,
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("notes");
  },
};
