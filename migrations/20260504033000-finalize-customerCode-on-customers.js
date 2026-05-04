"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Backfill existing customers without codes
    const [clients] = await queryInterface.sequelize.query("SELECT id FROM clients");
    
    for (const client of clients) {
      // Find max existing numeric code for this client
      const [maxCodeResult] = await queryInterface.sequelize.query(
        `SELECT MAX(CAST(customerCode AS UNSIGNED)) as maxCode FROM customers WHERE clientId = ${client.id} AND customerCode REGEXP '^[0-9]+$'`
      );
      
      let nextCode = 1;
      if (maxCodeResult[0] && maxCodeResult[0].maxCode) {
        nextCode = parseInt(maxCodeResult[0].maxCode) + 1;
      }

      const [customers] = await queryInterface.sequelize.query(
        `SELECT id FROM customers WHERE clientId = ${client.id} AND (customerCode IS NULL OR customerCode = '') ORDER BY id ASC`
      );

      for (const customer of customers) {
        await queryInterface.sequelize.query(
          `UPDATE customers SET customerCode = '${nextCode}' WHERE id = ${customer.id}`
        );
        nextCode++;
      }
    }

    // 2. Change column to NOT NULL
    await queryInterface.changeColumn("customers", "customerCode", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // 3. Add unique constraint for (clientId, customerCode)
    await queryInterface.addIndex("customers", ["clientId", "customerCode"], {
      unique: true,
      name: "unique_customer_code_per_client",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex("customers", "unique_customer_code_per_client");
    await queryInterface.changeColumn("customers", "customerCode", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
