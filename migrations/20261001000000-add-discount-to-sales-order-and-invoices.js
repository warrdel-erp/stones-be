'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('sales_orders', 'discountPercentage', {
        type: Sequelize.DECIMAL(15, 3),
        allowNull: true,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.addColumn('sales_order_invoices', 'discountPercentage', {
        type: Sequelize.DECIMAL(15, 3),
        allowNull: true,
        defaultValue: 0,
      }, { transaction });

      await queryInterface.addColumn('sales_order_invoices', 'discountAmount', {
        type: Sequelize.DECIMAL(15, 3),
        allowNull: true,
        defaultValue: 0,
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
      await queryInterface.removeColumn('sales_orders', 'discountPercentage', { transaction });
      await queryInterface.removeColumn('sales_order_invoices', 'discountPercentage', { transaction });
      await queryInterface.removeColumn('sales_order_invoices', 'discountAmount', { transaction });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
};
