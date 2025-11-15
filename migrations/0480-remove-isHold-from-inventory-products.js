"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove isHold column from inventory_products
    await queryInterface.removeColumn("inventory_products", "isHold");
  },

  async down(queryInterface, Sequelize) {
    // Add back isHold column
    await queryInterface.addColumn("inventory_products", "isHold", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // Restore isHold values based on inventory_product_holds table
    await queryInterface.sequelize.query(
      `UPDATE inventory_products ip
       INNER JOIN inventory_product_holds iph ON iph.inventoryProductId = ip.id
       SET ip.isHold = true`,
      { type: Sequelize.QueryTypes.UPDATE }
    );
  },
};
