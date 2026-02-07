"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("vendors", ["primaryPhoneNo", "clientId"], {
      unique: true,
      name: "unique_vendor_primary_phone_per_client",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("vendors", "unique_vendor_primary_phone_per_client");
  },
};
