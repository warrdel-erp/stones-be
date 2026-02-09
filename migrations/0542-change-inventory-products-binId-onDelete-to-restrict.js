"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Find the existing foreign key constraint for binId in inventory_products
    const [constraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'inventory_products' 
       AND COLUMN_NAME = 'binId'
       AND REFERENCED_TABLE_NAME IS NOT NULL`
    );

    if (constraints.length > 0) {
      const constraintName = constraints[0].CONSTRAINT_NAME;
      await queryInterface.sequelize.query(
        `ALTER TABLE inventory_products DROP FOREIGN KEY \`${constraintName}\``
      );
    }

    // Add foreign key constraint back with ON DELETE RESTRICT
    await queryInterface.addConstraint("inventory_products", {
      fields: ["binId"],
      type: "foreign key",
      name: "inventory_products_binId_fkey",
      references: {
        table: "bins",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop the RESTRICT constraint
    await queryInterface.removeConstraint("inventory_products", "inventory_products_binId_fkey");

    // Add back the CASCADE constraint
    await queryInterface.addConstraint("inventory_products", {
      fields: ["binId"],
      type: "foreign key",
      name: "inventory_products_binId_fkey",
      references: {
        table: "bins",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
