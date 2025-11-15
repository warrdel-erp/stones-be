"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, drop the existing foreign key constraint
    // Get the constraint name first
    const [constraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'inventory_product_holds' 
       AND COLUMN_NAME = 'createdById' 
       AND TABLE_SCHEMA = DATABASE()`
    );

    if (constraints.length > 0) {
      const constraintName = constraints[0].CONSTRAINT_NAME;
      await queryInterface.sequelize.query(`ALTER TABLE inventory_product_holds DROP FOREIGN KEY ${constraintName}`);
    }

    // Change the foreign key to reference accounts table
    await queryInterface.changeColumn("inventory_product_holds", "createdById", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "accounts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the foreign key constraint to accounts
    const [constraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_NAME = 'inventory_product_holds' 
       AND COLUMN_NAME = 'createdById' 
       AND TABLE_SCHEMA = DATABASE()`
    );

    if (constraints.length > 0) {
      const constraintName = constraints[0].CONSTRAINT_NAME;
      await queryInterface.sequelize.query(`ALTER TABLE inventory_product_holds DROP FOREIGN KEY ${constraintName}`);
    }

    // Revert back to users table
    await queryInterface.changeColumn("inventory_product_holds", "createdById", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },
};
