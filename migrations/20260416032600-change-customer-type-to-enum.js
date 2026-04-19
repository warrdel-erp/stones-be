"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Step 1: Backfill – set all existing rows to 'customer'
    await queryInterface.sequelize.query(
      `UPDATE customers SET type = 'customer' WHERE type IS NULL OR type NOT IN ('customer', 'fabricator');`,
      { raw: true }
    );

    // Step 2: Change column type to ENUM with allowed values
    await queryInterface.changeColumn("customers", "type", {
      type: Sequelize.ENUM("customer", "fabricator"),
      allowNull: false,
      defaultValue: "customer",
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert ENUM back to plain VARCHAR
    await queryInterface.changeColumn("customers", "type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Drop the ENUM type created by MySQL/Postgres (no-op on MySQL, needed on Postgres)
    // Sequelize handles this automatically on MySQL, but on Postgres you may need:
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_customers_type";');
  },
};
