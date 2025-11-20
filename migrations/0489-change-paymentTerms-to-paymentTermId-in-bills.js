"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new paymentTermId column
    await queryInterface.addColumn("bills", "paymentTermId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Copy existing data from paymentTerms to paymentTermId
    // Assuming paymentTerms contains string values that can be converted to integers
    await queryInterface.sequelize.query(
      `UPDATE bills SET paymentTermId = CAST(paymentTerms AS UNSIGNED) WHERE paymentTerms IS NOT NULL AND paymentTerms REGEXP '^[0-9]+$'`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // For non-numeric paymentTerms, set a default value (you may need to adjust this)
    // Or handle it based on your business logic
    await queryInterface.sequelize.query(`UPDATE bills SET paymentTermId = 1 WHERE paymentTermId IS NULL`, {
      type: Sequelize.QueryTypes.UPDATE,
    });

    // Make paymentTermId NOT NULL after data migration
    await queryInterface.changeColumn("bills", "paymentTermId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Remove old paymentTerms column
    await queryInterface.removeColumn("bills", "paymentTerms");
  },

  async down(queryInterface, Sequelize) {
    // Add back paymentTerms column
    await queryInterface.addColumn("bills", "paymentTerms", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Copy data back from paymentTermId to paymentTerms
    await queryInterface.sequelize.query(
      `UPDATE bills SET paymentTerms = CAST(paymentTermId AS CHAR) WHERE paymentTermId IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Make paymentTerms NOT NULL
    await queryInterface.changeColumn("bills", "paymentTerms", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Remove paymentTermId column
    await queryInterface.removeColumn("bills", "paymentTermId");
  },
};
