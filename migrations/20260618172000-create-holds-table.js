'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableExists = await queryInterface.tableExists('holds');
    if (!tableExists) {
      await queryInterface.createTable('holds', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        fabricatorId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'customers',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        customerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'customers',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        createdById: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'accounts',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        clientId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'clients',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        locationId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'locations',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
    }

    const inventoryProductHoldsTable = await queryInterface.describeTable('inventory_product_holds');
    
    // Add holdId if not exists
    if (!inventoryProductHoldsTable.holdId) {
      // Truncate first to prevent null constraint violations since holdId is non-nullable
      await queryInterface.sequelize.query('TRUNCATE TABLE inventory_product_holds;');
      await queryInterface.addColumn('inventory_product_holds', 'holdId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'holds',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }

    // Drop legacy columns if they exist
    if (inventoryProductHoldsTable.customerId) {
      await queryInterface.removeColumn('inventory_product_holds', 'customerId');
    }
    if (inventoryProductHoldsTable.note) {
      await queryInterface.removeColumn('inventory_product_holds', 'note');
    }
    if (inventoryProductHoldsTable.createdById) {
      await queryInterface.removeColumn('inventory_product_holds', 'createdById');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const inventoryProductHoldsTable = await queryInterface.describeTable('inventory_product_holds');
    
    if (inventoryProductHoldsTable.holdId) {
      await queryInterface.removeColumn('inventory_product_holds', 'holdId');
    }
    
    if (!inventoryProductHoldsTable.customerId) {
      await queryInterface.addColumn('inventory_product_holds', 'customerId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id',
        },
      });
    }
    
    if (!inventoryProductHoldsTable.note) {
      await queryInterface.addColumn('inventory_product_holds', 'note', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
    
    if (!inventoryProductHoldsTable.createdById) {
      await queryInterface.addColumn('inventory_product_holds', 'createdById', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'accounts',
          key: 'id',
        },
      });
    }

    const tableExists = await queryInterface.tableExists('holds');
    if (tableExists) {
      await queryInterface.dropTable('holds');
    }
  }
};
