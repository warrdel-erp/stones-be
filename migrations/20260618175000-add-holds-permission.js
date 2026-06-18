'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fetch all existing account IDs
    const [accounts] = await queryInterface.sequelize.query(
      'SELECT id FROM accounts'
    );

    if (accounts && accounts.length > 0) {
      // Fetch existing permissions for HOLDS to avoid duplicate entries
      const [existingPermissions] = await queryInterface.sequelize.query(
        "SELECT accountId FROM account_permissions WHERE permission = 'perm_8h2l9d4s'"
      );
      const existingAccountIds = new Set(existingPermissions.map(p => p.accountId));

      const permissionData = accounts
        .filter(account => !existingAccountIds.has(account.id))
        .map(account => ({
          permission: 'perm_8h2l9d4s',
          accountId: account.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }));

      if (permissionData.length > 0) {
        await queryInterface.bulkInsert('account_permissions', permissionData, {});
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('account_permissions', {
      permission: 'perm_8h2l9d4s'
    });
  }
};
