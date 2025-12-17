"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Rename number to name
    await queryInterface.renameColumn("containers", "number", "name");

    // Add siplId column
    await queryInterface.addColumn("containers", "siplId", {
      type: Sequelize.INTEGER,
      allowNull: true, // Temporarily nullable for migration
      references: {
        model: "sipls",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Add clientId column
    await queryInterface.addColumn("containers", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: true, // Temporarily nullable for migration
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Migrate existing SIPL containers to use new structure
    await queryInterface.sequelize.query(`
      UPDATE containers c
      INNER JOIN sipls s ON c.referenceId = s.id
      SET c.siplId = s.id, c.clientId = s.clientId
      WHERE c.referenceType = 'sipl'
    `);

    // Make siplId and clientId not null after migration
    await queryInterface.changeColumn("containers", "siplId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "sipls",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.changeColumn("containers", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // Remove referenceType and referenceId columns (containers now only belong to SIPL)
    await queryInterface.removeColumn("containers", "referenceType");
    await queryInterface.removeColumn("containers", "referenceId");
  },

  async down(queryInterface, Sequelize) {
    // Add back referenceType and referenceId columns
    await queryInterface.addColumn("containers", "referenceType", {
      type: Sequelize.ENUM("sipl", "purchase_order"),
      allowNull: true,
    });

    await queryInterface.addColumn("containers", "referenceId", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: true,
    });

    // Migrate data back
    await queryInterface.sequelize.query(`
      UPDATE containers
      SET referenceType = 'sipl', referenceId = siplId
      WHERE siplId IS NOT NULL
    `);

    // Remove new columns
    await queryInterface.removeColumn("containers", "siplId");
    await queryInterface.removeColumn("containers", "clientId");

    // Rename name back to number
    await queryInterface.renameColumn("containers", "name", "number");

    // Make referenceType and referenceId not null again
    await queryInterface.changeColumn("containers", "referenceType", {
      type: Sequelize.ENUM("sipl", "purchase_order"),
      allowNull: false,
    });

    await queryInterface.changeColumn("containers", "referenceId", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
    });
  },
};
