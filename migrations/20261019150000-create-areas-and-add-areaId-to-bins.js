'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableExists = async (table) => {
      try {
        await queryInterface.describeTable(table);
        return true;
      } catch {
        return false;
      }
    };

    // 1. Create 'areas' table if it doesn't exist
    if (!(await tableExists('areas'))) {
      await queryInterface.createTable('areas', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        warehouseId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'warehouses',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      });

      await queryInterface.addIndex('areas', ['warehouseId'], {
        name: 'areas_warehouse_id_idx',
      });
      await queryInterface.addIndex('areas', ['clientId'], {
        name: 'areas_client_id_idx',
      });
      await queryInterface.addIndex('areas', ['locationId'], {
        name: 'areas_location_id_idx',
      });
    }

    // 2. Add 'areaId' column to 'bins' table if it doesn't exist
    if (await tableExists('bins')) {
      const binsDesc = await queryInterface.describeTable('bins');
      if (!binsDesc.areaId) {
        await queryInterface.addColumn('bins', 'areaId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'areas',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        });
      }
    }

    // 3. Backfill default area for existing warehouses and assign to bins
    try {
      if (await tableExists('warehouses') && await tableExists('areas')) {
        await queryInterface.sequelize.query(`
          INSERT INTO areas (name, warehouseId, clientId, locationId, createdAt, updatedAt)
          SELECT 'Default Area', w.id, w.clientId, w.locationId, NOW(), NOW()
          FROM warehouses w
          WHERE NOT EXISTS (
            SELECT 1 FROM areas a WHERE a.warehouseId = w.id
          );
        `);

        if (await tableExists('bins')) {
          await queryInterface.sequelize.query(`
            UPDATE bins b
            JOIN areas a ON a.warehouseId = b.warehouseId AND a.name = 'Default Area'
            SET b.areaId = a.id
            WHERE b.areaId IS NULL;
          `);
        }
      }
    } catch (err) {
      console.warn('Warning during default areas backfill:', err.message);
    }
  },

  async down(queryInterface) {
    try {
      const tableExists = async (table) => {
        try {
          await queryInterface.describeTable(table);
          return true;
        } catch {
          return false;
        }
      };

      if (await tableExists('bins')) {
        const binsDesc = await queryInterface.describeTable('bins');
        if (binsDesc.areaId) {
          await queryInterface.removeColumn('bins', 'areaId');
        }
      }

      if (await tableExists('areas')) {
        await queryInterface.dropTable('areas');
      }
    } catch (err) {
      console.warn('Warning during areas rollback:', err.message);
    }
  },
};
