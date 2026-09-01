"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const plSql = `
      ALTER TABLE packaging_lists
      MODIFY COLUMN stage ENUM(
        'initiated',
        'loadingOrder',
        'partialLoadingOrder',
        'invoiced',
        'canceled'
      ) NOT NULL DEFAULT 'initiated'
    `;
    await queryInterface.sequelize.query(plSql);
  },

  async down(queryInterface, Sequelize) {
    const plSql = `
      ALTER TABLE packaging_lists
      MODIFY COLUMN stage ENUM(
        'initiated',
        'loadingOrder',
        'invoiced',
        'canceled'
      ) NOT NULL DEFAULT 'initiated'
    `;
    await queryInterface.sequelize.query(plSql);
  },
};
