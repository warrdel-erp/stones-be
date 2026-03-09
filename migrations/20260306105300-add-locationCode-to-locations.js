"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Add the column as nullable first to allow backfilling
        await queryInterface.addColumn("locations", "locationCode", {
            type: Sequelize.STRING(10),
            allowNull: true,
        });

        // 2. Fetch all existing records
        const [results] = await queryInterface.sequelize.query(
            "SELECT id, locationName FROM locations"
        );

        // 3. Update each row with capitalized first 3 characters of locationName
        for (const row of results) {
            const code = row.locationName ? row.locationName.substring(0, 3).toUpperCase() : "";
            await queryInterface.sequelize.query(
                "UPDATE locations SET locationCode = ? WHERE id = ?",
                {
                    replacements: [code, row.id],
                }
            );
        }

        // 4. Set the column to non-nullable
        await queryInterface.changeColumn("locations", "locationCode", {
            type: Sequelize.STRING(10),
            allowNull: false,
        });

        // 5. Add unique index for (clientId, locationCode)
        await queryInterface.addIndex("locations", ["clientId", "locationCode"], {
            unique: true,
            name: "locations_clientId_locationCode_unique",
        });
    },

    async down(queryInterface) {
        await queryInterface.removeIndex("locations", "locations_clientId_locationCode_unique");
        await queryInterface.removeColumn("locations", "locationCode");
    },
};
