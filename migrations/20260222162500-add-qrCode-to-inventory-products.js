"use strict";

const crypto = require("crypto");

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Add the column as nullable first to allow backfilling
        await queryInterface.addColumn("inventory_products", "qrCode", {
            type: Sequelize.UUID,
            allowNull: true,
            unique: true,
        });

        // 2. Fetch all existing records and update them with unique UUIDs
        const [results] = await queryInterface.sequelize.query(
            "SELECT id FROM inventory_products WHERE qrCode IS NULL"
        );

        for (const row of results) {
            await queryInterface.sequelize.query(
                "UPDATE inventory_products SET qrCode = ? WHERE id = ?",
                {
                    replacements: [crypto.randomUUID(), row.id],
                }
            );
        }

        // 3. Alter the column to satisfy the business rule (disallow nulls)
        await queryInterface.changeColumn("inventory_products", "qrCode", {
            type: Sequelize.UUID,
            allowNull: false,
            defaultValue: Sequelize.UUIDV4,
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn("inventory_products", "qrCode");
    },
};
