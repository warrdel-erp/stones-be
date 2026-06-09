"use strict";

require("ts-node/register/transpile-only");

const { COA_SUB_HEADERS } = require("../src/constants/coa");

module.exports = {
  up: async (queryInterface) => {
    const enumValues = COA_SUB_HEADERS.map((subHeader) => `'${String(subHeader.id)}'`).join(", ");

    await queryInterface.sequelize.query(`ALTER TABLE ledger_accounts MODIFY subHeaderId ENUM(${enumValues}) NOT NULL`);
  },

  down: async (queryInterface) => {
    const enumValues = COA_SUB_HEADERS.map((subHeader) => `'${String(subHeader.id)}'`).join(", ");

    await queryInterface.sequelize.query(`ALTER TABLE ledger_accounts MODIFY subHeaderId ENUM(${enumValues}) NOT NULL`);
  },
};
