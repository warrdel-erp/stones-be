"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_locations", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      locationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "locations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    // Add unique constraint
    await queryInterface.addIndex("user_locations", ["userId", "locationId"], {
      unique: true,
      name: "unique_user_location",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("user_locations");
  },
};
