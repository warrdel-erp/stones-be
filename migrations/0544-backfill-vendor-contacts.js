"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 1. Backfill primary contacts from vendor email/primaryPhoneNo
    const backfillPrimarySql = `
      INSERT INTO vendor_contacts (phone, email, isPrimary, vendorId, clientId, createdAt, updatedAt)
      SELECT primaryPhoneNo, email, true, id, clientId, :now, :now
      FROM vendors
      WHERE primaryPhoneNo IS NOT NULL OR email IS NOT NULL;
    `;

    // 2. Backfill secondary contacts from vendor secondaryPhoneNo
    const backfillSecondarySql = `
      INSERT INTO vendor_contacts (phone, email, isPrimary, vendorId, clientId, createdAt, updatedAt)
      SELECT secondaryPhoneNo, NULL, false, id, clientId, :now, :now
      FROM vendors
      WHERE secondaryPhoneNo IS NOT NULL;
    `;

    await queryInterface.sequelize.query(backfillPrimarySql, {
      replacements: { now },
    });

    await queryInterface.sequelize.query(backfillSecondarySql, {
      replacements: { now },
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query("DELETE FROM vendor_contacts;");
  },
};
