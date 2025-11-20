"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new loadingOrderId column
    await queryInterface.addColumn("invoice_deliveries", "loadingOrderId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "loading_orders",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Backfill data: Get loadingOrderId from sales_order_invoices table
    await queryInterface.sequelize.query(
      `UPDATE invoice_deliveries AS id
       INNER JOIN sales_order_invoices AS soi ON id.soInvoiceId = soi.id
       SET id.loadingOrderId = soi.loadingOrderId
       WHERE id.soInvoiceId IS NOT NULL AND soi.loadingOrderId IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // For any invoice_deliveries that couldn't be backfilled (if soInvoice doesn't exist or doesn't have loadingOrderId)
    // We'll set them to NULL temporarily, but since we're making it NOT NULL, we need to handle this
    // Check if there are any null values
    const [results] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM invoice_deliveries WHERE loadingOrderId IS NULL`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (results && results.count > 0) {
      // If there are null values, we can either delete them or set a default
      // For safety, we'll delete orphaned records that can't be backfilled
      await queryInterface.sequelize.query(`DELETE FROM invoice_deliveries WHERE loadingOrderId IS NULL`, {
        type: Sequelize.QueryTypes.DELETE,
      });
    }

    // Make loadingOrderId NOT NULL after data migration
    await queryInterface.changeColumn("invoice_deliveries", "loadingOrderId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "loading_orders",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Remove old soInvoiceId column
    await queryInterface.removeColumn("invoice_deliveries", "soInvoiceId");
  },

  async down(queryInterface, Sequelize) {
    // Add back soInvoiceId column
    await queryInterface.addColumn("invoice_deliveries", "soInvoiceId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "sales_order_invoices",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Backfill data: Get soInvoiceId from loading_orders -> sales_order_invoices
    await queryInterface.sequelize.query(
      `UPDATE invoice_deliveries AS id
       INNER JOIN sales_order_invoices AS soi ON id.loadingOrderId = soi.loadingOrderId
       SET id.soInvoiceId = soi.id
       WHERE id.loadingOrderId IS NOT NULL AND soi.id IS NOT NULL`,
      { type: Sequelize.QueryTypes.UPDATE }
    );

    // Delete records that couldn't be backfilled (loading orders without invoices)
    await queryInterface.sequelize.query(`DELETE FROM invoice_deliveries WHERE soInvoiceId IS NULL`, {
      type: Sequelize.QueryTypes.DELETE,
    });

    // Make soInvoiceId NOT NULL
    await queryInterface.changeColumn("invoice_deliveries", "soInvoiceId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "sales_order_invoices",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Remove loadingOrderId column
    await queryInterface.removeColumn("invoice_deliveries", "loadingOrderId");
  },
};
