'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('sales_order_requirement_lines', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      sales_order_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'sales_orders', key: 'id' }, onDelete: 'CASCADE' },
      product_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'products', key: 'id' } },
      unit_type: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'slabs' },
      required_count: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      allocated_count: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      unit_price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      tax_applied: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      min_length: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      min_width: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'PENDING' },
      client_id: { type: Sequelize.INTEGER, allowNull: false },
      location_id: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });
    await queryInterface.addColumn('sales_order_products', 'requirement_line_id', {
      type: Sequelize.INTEGER, allowNull: true, references: { model: 'sales_order_requirement_lines', key: 'id' }, onDelete: 'SET NULL'
    });
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('sales_order_products', 'requirement_line_id');
    await queryInterface.dropTable('sales_order_requirement_lines');
  }
};
