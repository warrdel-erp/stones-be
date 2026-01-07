"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("terms_conditions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      details: {
        type: Sequelize.TEXT,
        allowNull: true,
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add unique index to ensure one client can only have one terms and condition
    await queryInterface.addIndex("terms_conditions", ["clientId"], {
      unique: true,
      name: "unique_client_terms_conditions",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("terms_conditions");
  },
};
