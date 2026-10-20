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

    // 1. sales_orders
    if (await tableExists('sales_orders')) {
      const desc = await queryInterface.describeTable('sales_orders');
      if (!desc.createdById) {
        await queryInterface.addColumn('sales_orders', 'createdById', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'accounts',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        });
      }

      // Backfill sales_orders.createdById from accountId
      try {
        await queryInterface.sequelize.query(`
          UPDATE sales_orders
          SET createdById = accountId
          WHERE createdById IS NULL AND accountId IS NOT NULL;
        `);

        // Fallback to client accountId if any are still NULL
        await queryInterface.sequelize.query(`
          UPDATE sales_orders so
          JOIN clients c ON so.clientId = c.id
          SET so.createdById = c.accountId
          WHERE so.createdById IS NULL;
        `);
      } catch (err) {
        console.warn('Warning during sales_orders.createdById backfill:', err.message);
      }
    }

    // 2. packaging_lists
    if (await tableExists('packaging_lists')) {
      const desc = await queryInterface.describeTable('packaging_lists');
      if (!desc.createdById) {
        await queryInterface.addColumn('packaging_lists', 'createdById', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'accounts',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        });
      }

      // Backfill packaging_lists.createdById
      try {
        await queryInterface.sequelize.query(`
          UPDATE packaging_lists pl
          JOIN sales_orders so ON pl.salesOrderId = so.id
          SET pl.createdById = COALESCE(so.createdById, so.accountId)
          WHERE pl.createdById IS NULL;
        `);

        await queryInterface.sequelize.query(`
          UPDATE packaging_lists pl
          JOIN clients c ON pl.clientId = c.id
          SET pl.createdById = c.accountId
          WHERE pl.createdById IS NULL;
        `);

        await queryInterface.sequelize.query(`
          UPDATE packaging_lists pl
          SET pl.createdById = (SELECT id FROM accounts LIMIT 1)
          WHERE pl.createdById IS NULL;
        `);
      } catch (err) {
        console.warn('Warning during packaging_lists.createdById backfill:', err.message);
      }
    }

    // 3. loading_orders
    if (await tableExists('loading_orders')) {
      const desc = await queryInterface.describeTable('loading_orders');
      if (!desc.createdById) {
        await queryInterface.addColumn('loading_orders', 'createdById', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'accounts',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        });
      }

      // Backfill loading_orders.createdById
      try {
        await queryInterface.sequelize.query(`
          UPDATE loading_orders lo
          JOIN sales_orders so ON lo.salesOrderId = so.id
          SET lo.createdById = COALESCE(so.createdById, so.accountId)
          WHERE lo.createdById IS NULL;
        `);

        await queryInterface.sequelize.query(`
          UPDATE loading_orders lo
          JOIN clients c ON lo.clientId = c.id
          SET lo.createdById = c.accountId
          WHERE lo.createdById IS NULL;
        `);

        await queryInterface.sequelize.query(`
          UPDATE loading_orders lo
          SET lo.createdById = (SELECT id FROM accounts LIMIT 1)
          WHERE lo.createdById IS NULL;
        `);
      } catch (err) {
        console.warn('Warning during loading_orders.createdById backfill:', err.message);
      }
    }
  },

  async down(queryInterface) {
    const tableExists = async (table) => {
      try {
        await queryInterface.describeTable(table);
        return true;
      } catch {
        return false;
      }
    };

    const tables = ['loading_orders', 'packaging_lists', 'sales_orders'];
    for (const table of tables) {
      try {
        if (await tableExists(table)) {
          const desc = await queryInterface.describeTable(table);
          if (desc.createdById) {
            const [constraints] = await queryInterface.sequelize.query(
              `SELECT CONSTRAINT_NAME 
               FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
               WHERE TABLE_NAME = '${table}' 
               AND COLUMN_NAME = 'createdById' 
               AND TABLE_SCHEMA = DATABASE()`
            );

            for (const c of constraints) {
              try {
                await queryInterface.sequelize.query(`ALTER TABLE ${table} DROP FOREIGN KEY ${c.CONSTRAINT_NAME}`);
              } catch (_) {}
            }

            await queryInterface.removeColumn(table, 'createdById');
          }
        }
      } catch (err) {
        console.warn(`Warning during rollback of createdById on ${table}:`, err.message);
      }
    }
  },
};
