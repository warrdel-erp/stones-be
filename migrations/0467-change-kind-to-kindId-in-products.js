"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new kindId column
    await queryInterface.addColumn("products", "kindId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // Copy existing data from kind to kindId
    // Since kind was STRING and kindId is INTEGER, we need to map string values to IDs
    // Based on PRODUCT_KIND constant: { id: 1, value: "Stock" }, { id: 2, value: "No-Stock" }
    await queryInterface.sequelize.query(
      `UPDATE products SET kindId = CASE 
        WHEN kind = 'Stock' THEN 1
        WHEN kind = 'No-Stock' THEN 2
        ELSE NULL
      END WHERE kind IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Remove old kind column
    await queryInterface.removeColumn("products", "kind");
  },

  async down(queryInterface, Sequelize) {
    // Add back kind column
    await queryInterface.addColumn("products", "kind", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Copy data back from kindId to kind
    await queryInterface.sequelize.query(
      `UPDATE products SET kind = CASE 
        WHEN kindId = 1 THEN 'Stock'
        WHEN kindId = 2 THEN 'No-Stock'
        ELSE NULL
      END WHERE kindId IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Remove kindId column
    await queryInterface.removeColumn("products", "kindId");
  },
};
