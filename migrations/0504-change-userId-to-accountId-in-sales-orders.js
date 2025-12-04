"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, drop the existing foreign key constraint
    const [constraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'sales_orders' 
       AND COLUMN_NAME = 'userId' 
       AND TABLE_SCHEMA = DATABASE()`
    );

    if (constraints.length > 0) {
      const constraintName = constraints[0].CONSTRAINT_NAME;
      await queryInterface.sequelize.query(`ALTER TABLE sales_orders DROP FOREIGN KEY ${constraintName}`);
    }

    // Rename the column
    await queryInterface.renameColumn("sales_orders", "userId", "accountId");

    // Add new foreign key constraint to accounts table
    await queryInterface.addConstraint("sales_orders", {
      fields: ["accountId"],
      type: "foreign key",
      name: "sales_orders_accountId_fkey",
      references: {
        table: "accounts",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the foreign key constraint to accounts
    await queryInterface.removeConstraint("sales_orders", "sales_orders_accountId_fkey");

    // Rename the column back
    await queryInterface.renameColumn("sales_orders", "accountId", "userId");

    // Add back the foreign key constraint to users table
    await queryInterface.addConstraint("sales_orders", {
      fields: ["userId"],
      type: "foreign key",
      name: "sales_orders_userId_fkey",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
};
