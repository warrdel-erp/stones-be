'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Fetch all slab type inventory products
    const [products] = await queryInterface.sequelize.query(
      `SELECT id, combinedNumber FROM inventory_products WHERE isSlabType = true AND combinedNumber IS NOT NULL`
    );

    for (const product of products) {
      const { id, combinedNumber } = product;
      if (combinedNumber && combinedNumber.includes('-')) {
        const parts = combinedNumber.split('-');
        if (parts.length === 2) {
          const newCombinedNumber = `${parts[0]}-1-${parts[1]}`;
          await queryInterface.sequelize.query(
            `UPDATE inventory_products SET combinedNumber = :newCombinedNumber WHERE id = :id`,
            {
              replacements: { newCombinedNumber, id },
              type: Sequelize.QueryTypes.UPDATE,
            }
          );
        }
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // 1. Fetch all slab type inventory products
    const [products] = await queryInterface.sequelize.query(
      `SELECT id, combinedNumber FROM inventory_products WHERE isSlabType = true AND combinedNumber IS NOT NULL`
    );

    for (const product of products) {
      const { id, combinedNumber } = product;
      if (combinedNumber && combinedNumber.includes('-')) {
        const parts = combinedNumber.split('-');
        // Convert back from 3-parts (with 1 in the middle) if the middle part is indeed '1'
        if (parts.length === 3 && parts[1] === '1') {
          const originalCombinedNumber = `${parts[0]}-${parts[2]}`;
          await queryInterface.sequelize.query(
            `UPDATE inventory_products SET combinedNumber = :originalCombinedNumber WHERE id = :id`,
            {
              replacements: { originalCombinedNumber, id },
              type: Sequelize.QueryTypes.UPDATE,
            }
          );
        }
      }
    }
  }
};
