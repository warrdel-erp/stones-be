"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const permissions = [
      "perm_8f3a1d9c", // SERVICES
      "perm_2b7e4g6h", // CUSTOMER
      "perm_9x5j2k8l", // SUPPLIER
      "perm_1m6n3p0q", // VENDOR
      "perm_4r8s5t2u", // PRODUCTS
      "perm_7v9w3x1y", // RETURNS
      "perm_5z2a6b4c", // SELECTION_SHEET
      "perm_0d8e1f3g", // DELIVERIES
      "perm_6h5i9j2k", // SALES
      "perm_3l7m4n8p", // PURCHASE
      "perm_a1b2c3d4", // USERS
      "perm_9k2j5h1g", // PERMISSION_MANAGEMENT
      "perm_5t7u9v1w", // TRUCKS
      "perm_3d5f7g9h", // CREDIT_DEBIT_NOTE
      "perm_2a4s6d8f", // TRANSACTIONS
      "perm_1q3w5e7r", // CHART_OF_ACCOUNTS
      "perm_0z9x8c7v", // BALANCE_SHEET
    ];

    const accountId = 1; // Ethan Sterling (Client)
    
    const permissionData = permissions.map((perm) => ({
      permission: perm,
      accountId: accountId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert("account_permissions", permissionData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("account_permissions", {
      accountId: 1,
    });
  },
};
