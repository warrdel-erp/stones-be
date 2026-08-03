"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Drop foreign key constraint on inventoryProductId if it exists
    const [fkConstraints] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME 
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
       WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'inventory_product_holds' 
       AND COLUMN_NAME = 'inventoryProductId'
       AND REFERENCED_TABLE_NAME IS NOT NULL`
    );

    for (const row of fkConstraints) {
      try {
        await queryInterface.sequelize.query(
          `ALTER TABLE inventory_product_holds DROP FOREIGN KEY \`${row.CONSTRAINT_NAME}\``
        );
      } catch (err) {
        console.log(`Failed to drop FK ${row.CONSTRAINT_NAME}:`, err.message);
      }
    }

    // 2. Drop unique index(es) on inventoryProductId
    try {
      const indexes = await queryInterface.showIndex("inventory_product_holds");
      for (const idx of indexes) {
        const isTargetCol = idx.fields.some(
          (f) => f.attribute === "inventoryProductId" || f.column === "inventoryProductId" || f.name === "inventoryProductId"
        );
        if (isTargetCol && idx.unique) {
          try {
            await queryInterface.sequelize.query(
              `ALTER TABLE inventory_product_holds DROP INDEX \`${idx.name}\``
            );
          } catch (err) {
            console.log(`Failed to drop index ${idx.name}:`, err.message);
          }
        }
      }
    } catch (err) {
      console.log("Error checking indexes:", err.message);
    }

    // 3. Re-add Foreign Key constraint (non-unique)
    try {
      await queryInterface.addConstraint("inventory_product_holds", {
        fields: ["inventoryProductId"],
        type: "foreign key",
        name: "inventory_product_holds_inventory_product_id_fk",
        references: {
          table: "inventory_products",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      });
    } catch (err) {
      console.log("FK re-add note:", err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {},
};
