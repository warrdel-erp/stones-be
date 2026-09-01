"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableName = "loading_orders";
    const columnName = "packagingListId";

    // 1. Find foreign key constraint name
    const [results] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = '${tableName}' 
        AND COLUMN_NAME = '${columnName}' 
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    
    let fkName = results.length > 0 ? results[0].CONSTRAINT_NAME : null;

    // 2. Find the unique index name
    const [indexes] = await queryInterface.sequelize.query(`
      SHOW INDEX FROM ${tableName} WHERE Column_name = '${columnName}' AND Non_unique = 0;
    `);

    const indexName = indexes.length > 0 ? indexes[0].Key_name : null;

    // 3. Drop foreign key if exists
    if (fkName) {
      await queryInterface.removeConstraint(tableName, fkName);
    }

    // 4. Drop unique index if exists
    if (indexName) {
      await queryInterface.removeIndex(tableName, indexName);
    }

    // 5. Create a non-unique index to support the foreign key
    await queryInterface.addIndex(tableName, [columnName], {
      name: `${tableName}_${columnName}_idx`
    });

    // 6. Recreate the foreign key constraint
    if (fkName) {
      await queryInterface.addConstraint(tableName, {
        fields: [columnName],
        type: 'foreign key',
        name: fkName,
        references: {
          table: 'packaging_lists',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableName = "loading_orders";
    const columnName = "packagingListId";

    const [results] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = '${tableName}' 
        AND COLUMN_NAME = '${columnName}' 
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);
    
    let fkName = results.length > 0 ? results[0].CONSTRAINT_NAME : null;

    if (fkName) {
      await queryInterface.removeConstraint(tableName, fkName);
    }

    await queryInterface.removeIndex(tableName, `${tableName}_${columnName}_idx`);

    await queryInterface.addIndex(tableName, [columnName], {
      unique: true,
      name: `${tableName}_${columnName}_unique`
    });

    if (fkName) {
      await queryInterface.addConstraint(tableName, {
        fields: [columnName],
        type: 'foreign key',
        name: fkName,
        references: {
          table: 'packaging_lists',
          field: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  },
};
