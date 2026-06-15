"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Find and de-duplicate customer names per client
    const [duplicates] = await queryInterface.sequelize.query(
      "SELECT name, clientId, COUNT(*) as count FROM customers GROUP BY name, clientId HAVING count > 1"
    );

    for (const dup of duplicates) {
      const name = dup.name;
      const clientId = dup.clientId;

      // Find all records with this name and clientId, ordered by id
      const [records] = await queryInterface.sequelize.query(
        "SELECT id FROM customers WHERE name = :name AND clientId = :clientId ORDER BY id",
        {
          replacements: { name, clientId },
        }
      );

      // Rename from second record onwards
      for (let i = 1; i < records.length; i++) {
        const recordId = records[i].id;
        const newName = `${name} - ${i}`;
        await queryInterface.sequelize.query(
          "UPDATE customers SET name = :newName WHERE id = :recordId",
          {
            replacements: { newName, recordId },
          }
        );
      }
    }

    // 2. Add the unique index
    await queryInterface.addIndex("customers", ["name", "clientId"], {
      unique: true,
      name: "unique_customer_name_per_client",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("customers", "unique_customer_name_per_client");
  },
};
