'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. Remove locationId from deliveries
      await queryInterface.removeColumn('deliveries', 'locationId', { transaction });
      
      // 2. Drop invoice_deliveries table
      await queryInterface.dropTable('invoice_deliveries', { transaction });
      
      // 3. Create delivery_addresses table
      await queryInterface.createTable('delivery_addresses', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        deliveryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'deliveries',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        clientId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'clients',
            key: 'id'
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        },
        fromLat: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        fromLng: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        fromAddress: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        toLat: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        toLng: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        toAddress: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: true
        },
        referenceType: {
          type: Sequelize.ENUM('packagingList', 'loadingOrder'),
          allowNull: false
        },
        referenceId: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }, { transaction });

      // 4. Create delivery_items table
      await queryInterface.createTable('delivery_items', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        deliveryAddressId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'delivery_addresses',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        deliveryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'deliveries',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        clientId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'clients',
            key: 'id'
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        },
        salesOrderProductId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'sales_order_products',
            key: 'id'
          },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE'
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }, { transaction });

      // 5. Add indexes
      await queryInterface.addIndex('delivery_addresses', ['deliveryId'], { transaction });
      await queryInterface.addIndex('delivery_addresses', ['referenceType', 'referenceId'], { transaction });
      await queryInterface.addIndex('delivery_items', ['deliveryAddressId'], { transaction });
      await queryInterface.addIndex('delivery_items', ['deliveryId'], { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('delivery_items', { transaction });
      await queryInterface.dropTable('delivery_addresses', { transaction });
      
      await queryInterface.addColumn('deliveries', 'locationId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'locations',
          key: 'id'
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
      }, { transaction });
      
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
