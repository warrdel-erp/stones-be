"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new paymentTermId column
    await queryInterface.addColumn("loading_orders", "paymentTermId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Copy existing data from paymentTerms to paymentTermId
    await queryInterface.sequelize.query(
      `UPDATE loading_orders SET paymentTermId = CAST(paymentTerms AS UNSIGNED) WHERE paymentTerms IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Remove old paymentTerms column
    await queryInterface.removeColumn("loading_orders", "paymentTerms");
  },

  async down(queryInterface, Sequelize) {
    // Add back paymentTerms column
    await queryInterface.addColumn("loading_orders", "paymentTerms", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Copy data back from paymentTermId to paymentTerms
    await queryInterface.sequelize.query(
      `UPDATE loading_orders SET paymentTerms = CAST(paymentTermId AS CHAR) WHERE paymentTermId IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Remove paymentTermId column
    await queryInterface.removeColumn("loading_orders", "paymentTermId");
  },
};
