"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Backfill any existing NULL entityType records to 'customer'
    await queryInterface.bulkUpdate("s3_files", { entityType: "customer" }, { entityType: null });

    await queryInterface.changeColumn("s3_files", "entityType", {
      type: Sequelize.ENUM(
        "customer",
        "vendor",
        "product",
        "salesOrder",
        "purchaseOrder",
        "sipl",
        "inventoryProduct",
        "loadingOrder",
        "payment",
        "bill"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("s3_files", "entityType", {
      type: Sequelize.ENUM(
        "customer",
        "vendor",
        "product",
        "salesOrder",
        "purchaseOrder",
        "sipl",
        "inventoryProduct",
        "loadingOrder",
        "payment",
        "bill"
      ),
      allowNull: true,
    });
  },
};
