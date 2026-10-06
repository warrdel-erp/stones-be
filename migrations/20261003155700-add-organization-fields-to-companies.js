'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('companies');
    const transaction = await queryInterface.sequelize.transaction();

    try {
      if (!tableInfo.displayName) {
        await queryInterface.addColumn('companies', 'displayName', {
          type: Sequelize.STRING(255),
          allowNull: true,
        }, { transaction });
      }

      if (!tableInfo.taxId) {
        await queryInterface.addColumn('companies', 'taxId', {
          type: Sequelize.STRING(255),
          allowNull: true,
        }, { transaction });
      }

      if (!tableInfo.website) {
        await queryInterface.addColumn('companies', 'website', {
          type: Sequelize.STRING(255),
          allowNull: true,
        }, { transaction });
      }

      if (!tableInfo.addressLine2) {
        await queryInterface.addColumn('companies', 'addressLine2', {
          type: Sequelize.STRING(255),
          allowNull: true,
        }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('companies', 'displayName', { transaction });
      await queryInterface.removeColumn('companies', 'taxId', { transaction });
      await queryInterface.removeColumn('companies', 'website', { transaction });
      await queryInterface.removeColumn('companies', 'addressLine2', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
