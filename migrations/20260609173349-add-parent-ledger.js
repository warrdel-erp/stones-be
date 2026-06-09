"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add parentId column to ledger_accounts
    await queryInterface.addColumn("ledger_accounts", "parentId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "ledger_accounts",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // 2. Fetch all clients to create parent accounts per client
    const [clients] = await queryInterface.sequelize.query(
      "SELECT id FROM clients"
    );

    for (const client of clients) {
      const clientId = client.id;

      // Ensure Account Receivable parent ledger exists
      let [existingAR] = await queryInterface.sequelize.query(
        `SELECT id FROM ledger_accounts WHERE clientId = ${clientId} AND \`key\` = 'account_receivable' LIMIT 1`
      );

      let arId;
      if (existingAR.length === 0) {
        // Find next code for subHeaderId = 3
        const [maxARCode] = await queryInterface.sequelize.query(
          `SELECT MAX(code) as maxCode FROM ledger_accounts WHERE clientId = ${clientId} AND subHeaderId = 3`
        );
        let arCode = (maxARCode[0] && maxARCode[0].maxCode) ? maxARCode[0].maxCode + 1 : 121001;

        const [insertAR] = await queryInterface.sequelize.query(
          `INSERT INTO ledger_accounts (name, \`key\`, type, openingBalance, openingDate, subHeaderId, code, clientId, parentId)
           VALUES ('Account Receivable', 'account_receivable', 'dr', 0.00, NOW(), 3, ${arCode}, ${clientId}, NULL)`
        );
        arId = insertAR;
      } else {
        arId = existingAR[0].id;
      }

      // Ensure Account Payables parent ledger exists
      let [existingAP] = await queryInterface.sequelize.query(
        `SELECT id FROM ledger_accounts WHERE clientId = ${clientId} AND \`key\` = 'account_payables' LIMIT 1`
      );

      let apId;
      if (existingAP.length === 0) {
        // Find next code for subHeaderId = 30
        const [maxAPCode] = await queryInterface.sequelize.query(
          `SELECT MAX(code) as maxCode FROM ledger_accounts WHERE clientId = ${clientId} AND subHeaderId = 30`
        );
        let apCode = (maxAPCode[0] && maxAPCode[0].maxCode) ? maxAPCode[0].maxCode + 1 : 211001;

        const [insertAP] = await queryInterface.sequelize.query(
          `INSERT INTO ledger_accounts (name, \`key\`, type, openingBalance, openingDate, subHeaderId, code, clientId, parentId)
           VALUES ('Account Payables', 'account_payables', 'cr', 0.00, NOW(), 30, ${apCode}, ${clientId}, NULL)`
        );
        apId = insertAP;
      } else {
        apId = existingAP[0].id;
      }

      // Update existing customer ledgers (subHeaderId = 3 or referenceType = 'CUSTOMER')
      // Note: customer ledgers are subHeaderId = 3, but let's exclude the new parent itself to avoid self-reference!
      await queryInterface.sequelize.query(
        `UPDATE ledger_accounts 
         SET parentId = ${arId} 
         WHERE clientId = ${clientId} 
           AND referenceType = 'CUSTOMER' 
           AND id != ${arId}`
      );

      // Update existing vendor ledgers (subHeaderId = 30 or referenceType = 'VENDOR')
      // Exclude the parent AP itself!
      await queryInterface.sequelize.query(
        `UPDATE ledger_accounts 
         SET parentId = ${apId} 
         WHERE clientId = ${clientId} 
           AND referenceType = 'VENDOR' 
           AND id != ${apId}`
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // 1. Remove parent association
    await queryInterface.sequelize.query(
      "UPDATE ledger_accounts SET parentId = NULL"
    );

    // 2. Delete parent ledgers
    await queryInterface.sequelize.query(
      "DELETE FROM ledger_accounts WHERE `key` IN ('account_receivable', 'account_payables')"
    );

    // 3. Remove parentId column
    await queryInterface.removeColumn("ledger_accounts", "parentId");
  },
};
