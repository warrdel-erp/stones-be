"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if column already exists to prevent errors (defensive)
    const tableInfo = await queryInterface.describeTable("trade_services");
    if (tableInfo.clientId) return;

    await queryInterface.addColumn("trade_services", "clientId", {
      type: Sequelize.INTEGER,
      allowNull: true, // Initially true for backfilling
      references: {
        model: "clients",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    // NOTE: Backfilling logic should typically happen here if there are existing records.
    // Since we are standardizing, we assume new records will use clientId.
    // For existing records, they might need to be resolved via loadingOrderId or siplId.
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("trade_services", "clientId");
  },
};
