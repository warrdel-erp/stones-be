"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("journal_entries", "subType", {
            type: Sequelize.ENUM("inventory_variance"),
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn("journal_entries", "subType");
    },
};
