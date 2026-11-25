'use strict';

const PERMISSIONS = [
  "perm_8f3a1d9c", // SERVICES
  "perm_2b7e4g6h", // CUSTOMER
  "perm_9x5j2k8l", // SUPPLIER
  "perm_1m6n3p0q", // VENDOR
  "perm_4r8s5t2u", // PRODUCTS
  "perm_7v9w3x1y", // RETURNS
  "perm_5z2a6b4c", // SELECTION_SHEET
  "perm_8h2l9d4s", // HOLDS
  "perm_0d8e1f3g", // DELIVERIES
  "perm_6h5i9j2k", // SALES
  "perm_3l7m4n8p", // PURCHASE
  "perm_9k2j5h1g", // PERMISSION_MANAGEMENT
  "perm_a1b2c3d4", // USERS
  "perm_5t7u9v1w", // TRUCKS
  "perm_3d5f7g9h", // CREDIT_DEBIT_NOTE
  "perm_2a4s6d8f", // TRANSACTIONS
  "perm_1q3w5e7r", // CHART_OF_ACCOUNTS
  "perm_0z9x8c7v", // BALANCE_SHEET
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create `roles` table
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isSystem: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      systemRoleKey: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      clientId: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    // 2. Create `role_permissions` table
    await queryInterface.createTable('role_permissions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      permission: {
        type: Sequelize.STRING(100),
        allowNull: false,
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

    try {
      await queryInterface.addIndex('role_permissions', ['roleId', 'permission'], {
        unique: true,
        name: 'unique_role_permission',
      });
    } catch (e) {
      console.warn('Index unique_role_permission notice:', e.message);
    }

    // 3. Add columns to `companies`
    const companiesTableDesc = await queryInterface.describeTable('companies');

    if (!companiesTableDesc.qrCode) {
      await queryInterface.addColumn('companies', 'qrCode', {
        type: Sequelize.STRING(36),
        allowNull: true,
      });
    }
    if (!companiesTableDesc.s3FileId) {
      await queryInterface.addColumn('companies', 's3FileId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 's3_files',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
    if (!companiesTableDesc.userCount) {
      await queryInterface.addColumn('companies', 'userCount', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      });
    }
    if (!companiesTableDesc.defaultPaymentTerms) {
      await queryInterface.addColumn('companies', 'defaultPaymentTerms', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!companiesTableDesc.defaultQuotationValidity) {
      await queryInterface.addColumn('companies', 'defaultQuotationValidity', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 30,
      });
    }
    if (!companiesTableDesc.defaultLocationId) {
      await queryInterface.addColumn('companies', 'defaultLocationId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'locations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }

    // 4. Add columns to `users`
    const usersTableDesc = await queryInterface.describeTable('users');

    if (!usersTableDesc.roleId) {
      await queryInterface.addColumn('users', 'roleId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
    if (!usersTableDesc.locationScope) {
      await queryInterface.addColumn('users', 'locationScope', {
        type: Sequelize.ENUM('location', 'company'),
        allowNull: false,
        defaultValue: 'location',
      });
    }
    if (!usersTableDesc.companyId) {
      await queryInterface.addColumn('users', 'companyId', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    // 5. Seed default system roles
    const now = new Date();
    await queryInterface.bulkInsert('roles', [
      {
        id: 1,
        name: 'Company Admin',
        description: 'System administrator role with full company-wide access and permissions',
        isSystem: true,
        systemRoleKey: 'ADMIN',
        clientId: null,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: 'Driver',
        description: 'System role for delivery drivers',
        isSystem: true,
        systemRoleKey: 'DRIVER',
        clientId: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // Seed permissions for Role 1 (Company Admin)
    const adminPermissions = PERMISSIONS.map((perm) => ({
      roleId: 1,
      permission: perm,
      createdAt: now,
      updatedAt: now,
    }));
    await queryInterface.bulkInsert('role_permissions', adminPermissions);

    // Seed permission for Role 2 (Driver)
    await queryInterface.bulkInsert('role_permissions', [
      {
        roleId: 2,
        permission: 'perm_0d8e1f3g', // DELIVERIES
        createdAt: now,
        updatedAt: now,
      },
    ]);

    // 6. Migrate data from `clients` to `companies` and `users`
    try {
      await queryInterface.sequelize.query(`
        UPDATE companies c
        JOIN clients cl ON c.clientId = cl.id
        SET 
          c.qrCode = cl.qrCode,
          c.s3FileId = cl.s3FileId,
          c.userCount = COALESCE(cl.userCount, 10),
          c.defaultPaymentTerms = cl.defaultPaymentTerms,
          c.defaultQuotationValidity = COALESCE(cl.defaultQuotationValidity, 30),
          c.defaultLocationId = cl.defaultLocationId
        WHERE c.clientId IS NOT NULL;
      `);
    } catch (e) {
      console.warn('Migration: backfill companies from clients skipped:', e.message);
    }

    try {
      await queryInterface.sequelize.query(`
        INSERT INTO users (username, userid, phone, accountId, clientId, companyId, defaultLocationId, roleId, locationScope, createdAt, updatedAt)
        SELECT 
          CONCAT(cl.firstName, ' ', cl.lastName) AS username,
          CONCAT('client_', cl.id) AS userid,
          cl.phone,
          cl.accountId,
          cl.id AS clientId,
          cl.id AS companyId,
          cl.defaultLocationId,
          1 AS roleId,
          'company' AS locationScope,
          cl.createdAt,
          cl.updatedAt
        FROM clients cl
        WHERE cl.accountId NOT IN (SELECT accountId FROM users WHERE accountId IS NOT NULL);
      `);
    } catch (e) {
      console.warn('Migration: backfill client users skipped:', e.message);
    }

    try {
      await queryInterface.sequelize.query(`
        UPDATE users
        SET 
          companyId = clientId,
          roleId = CASE WHEN role = 'driver' THEN 2 ELSE 1 END,
          locationScope = CASE WHEN role = 'driver' THEN 'location' ELSE 'company' END
        WHERE roleId IS NULL;
      `);
    } catch (e) {
      console.warn('Migration: backfill users roleId skipped:', e.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'companyId');
    await queryInterface.removeColumn('users', 'locationScope');
    await queryInterface.removeColumn('users', 'roleId');

    await queryInterface.removeColumn('companies', 'defaultLocationId');
    await queryInterface.removeColumn('companies', 'defaultQuotationValidity');
    await queryInterface.removeColumn('companies', 'defaultPaymentTerms');
    await queryInterface.removeColumn('companies', 'userCount');
    await queryInterface.removeColumn('companies', 's3FileId');
    await queryInterface.removeColumn('companies', 'qrCode');

    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('roles');
  },
};
