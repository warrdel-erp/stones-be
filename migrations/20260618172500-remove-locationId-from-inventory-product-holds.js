'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('inventory_product_holds');
    
    if (tableInfo.locationId) {
      // It might have a foreign key constraint. In MySQL, you often need to drop the FK first.
      // Wait, Sequelize sometimes fails to drop columns with FKs directly. Let's try to find and drop the FK first.
      
      const constraints = await queryInterface.showConstraint('inventory_product_holds');
      // If we don't know the name, we could remove it, but Sequelize `removeColumn` handles dropping FKs in newer versions, though not perfectly on all dialects.
      // Actually, removing `locationId` should work if we just use removeColumn, or we can use raw query.
      
      // Let's use raw query to ensure FK is dropped if it fails using removeColumn.
      // But let's first try removeColumn.
      try {
        await queryInterface.removeColumn('inventory_product_holds', 'locationId');
      } catch (err) {
        console.log("Fallback: Dropping FK constraint first");
        // Need to find constraint name.
        const [results] = await queryInterface.sequelize.query(`
          SELECT CONSTRAINT_NAME
          FROM information_schema.KEY_COLUMN_USAGE
          WHERE TABLE_NAME = 'inventory_product_holds'
            AND COLUMN_NAME = 'locationId'
            AND REFERENCED_TABLE_NAME IS NOT NULL;
        `);
        
        if (results && results.length > 0) {
          const fkName = results[0].CONSTRAINT_NAME;
          await queryInterface.removeConstraint('inventory_product_holds', fkName);
        }
        
        await queryInterface.removeColumn('inventory_product_holds', 'locationId');
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('inventory_product_holds');
    
    if (!tableInfo.locationId) {
      await queryInterface.addColumn('inventory_product_holds', 'locationId', {
        type: Sequelize.INTEGER,
        allowNull: true, // Making it nullable for the down migration to avoid locking/errors
        references: {
          model: 'locations',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }
};
