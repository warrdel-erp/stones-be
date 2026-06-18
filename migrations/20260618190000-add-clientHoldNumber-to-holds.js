'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add column clientHoldNumber as nullable first
    await queryInterface.addColumn('holds', 'clientHoldNumber', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    // 2. Fetch all holds order by clientId, id to backfill
    const [holds] = await queryInterface.sequelize.query(
      'SELECT id, clientId FROM holds ORDER BY clientId ASC, id ASC;',
      { raw: true }
    );

    // 3. Sequential update
    const clientCounters = {};
    for (const hold of holds) {
      const { id, clientId } = hold;
      if (!clientCounters[clientId]) {
        clientCounters[clientId] = 0;
      }
      clientCounters[clientId] += 1;
      const num = clientCounters[clientId];
      await queryInterface.sequelize.query(
        `UPDATE holds SET clientHoldNumber = ${num} WHERE id = ${id};`,
        { raw: true }
      );
    }

    // 4. Change column to NOT NULL
    await queryInterface.changeColumn('holds', 'clientHoldNumber', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // 5. Add unique index
    await queryInterface.addIndex('holds', ['clientId', 'clientHoldNumber'], {
      unique: true,
      name: 'unique_clientId_clientHoldNumber_in_holds'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('holds', 'unique_clientId_clientHoldNumber_in_holds');
    await queryInterface.removeColumn('holds', 'clientHoldNumber');
  }
};
