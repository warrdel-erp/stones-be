"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex("customers", ["primaryPhoneNumber", "clientId"], {
      unique: true,
      name: "unique_primary_phone_per_client",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("customers", "unique_primary_phone_per_client");
  },
};
