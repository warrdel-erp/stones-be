'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

        await queryInterface.removeIndex(
            "product_groups",
            "name"
        );
        
        await queryInterface.addIndex(
            "product_groups",
            ["name", "clientId"],
            {
                unique: true,
                name: "unique_group_per_client",
            }
        );
  },

  async down (queryInterface, Sequelize) {
    
        await queryInterface.removeIndex(
            "product_groups",
            "unique_group_per_client"
        );

        await queryInterface.addIndex(
            "product_groups",
            ["name"],
            {
                unique: true,
                name: "unique_group_name",
            }
        );
  }
};
