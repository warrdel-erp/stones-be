"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // MySQL: alter ENUM by redefining the column with the new set of values
    const sql = `
      ALTER TABLE trade_services
      MODIFY COLUMN referenceType ENUM(
        'loadingOrder',
        'sipl',
        'return'
      ) NOT NULL
    `;
    await queryInterface.sequelize.query(sql);
  },

  down: async (queryInterface, Sequelize) => {
    // WARNING: This will fail if any rows currently use 'return'
    const sql = `
      ALTER TABLE trade_services
      MODIFY COLUMN referenceType ENUM(
        'loadingOrder',
        'sipl'
      ) NOT NULL
    `;
    await queryInterface.sequelize.query(sql);
  },
};

