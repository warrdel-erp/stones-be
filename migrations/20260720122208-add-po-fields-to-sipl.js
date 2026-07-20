'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('sipls', 'poDate', {
        type: Sequelize.DATEONLY,
        allowNull: true,
      }, { transaction });
      
      await queryInterface.addColumn('sipls', 'etaDate', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });
      
      await queryInterface.addColumn('sipls', 'expiryDate', {
        type: Sequelize.DATE,
        allowNull: true,
      }, { transaction });
      
      await queryInterface.addColumn('sipls', 'deliveryType', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });
      
      await queryInterface.addColumn('sipls', 'shipmentTerms', {
        type: Sequelize.STRING,
        allowNull: true,
      }, { transaction });
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('sipls', 'poDate', { transaction });
      await queryInterface.removeColumn('sipls', 'etaDate', { transaction });
      await queryInterface.removeColumn('sipls', 'expiryDate', { transaction });
      await queryInterface.removeColumn('sipls', 'deliveryType', { transaction });
      await queryInterface.removeColumn('sipls', 'shipmentTerms', { transaction });
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
