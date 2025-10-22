"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new scopeId column
    await queryInterface.addColumn("customers", "scopeId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Copy existing data from scope to scopeId (convert ENUM string to INTEGER)
    await queryInterface.sequelize.query(
      `UPDATE customers SET scopeId = CAST(scope AS UNSIGNED) WHERE scope IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Remove old scope column
    await queryInterface.removeColumn("customers", "scope");
  },

  async down(queryInterface, Sequelize) {
    // Add back scope column as ENUM
    await queryInterface.addColumn("customers", "scope", {
      type: Sequelize.ENUM("1", "2"),
      allowNull: true,
    });

    // Copy data back from scopeId to scope
    await queryInterface.sequelize.query(
      `UPDATE customers SET scope = CAST(scopeId AS CHAR) WHERE scopeId IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Remove scopeId column
    await queryInterface.removeColumn("customers", "scopeId");
  },
};
