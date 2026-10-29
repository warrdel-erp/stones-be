'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

        await queryInterface.removeIndex(
            "product_finishes",
            "name"
        );
        
        await queryInterface.addIndex(
            "product_finishes",
            ["name", "clientId"],
            {
                unique: true,
                name: "unique_finish_per_client",
            }
        );
  },

  async down (queryInterface, Sequelize) {
    
        await queryInterface.removeIndex(
            "product_finishes",
            "unique_finish_per_client"
        );

        await queryInterface.addIndex(
            "product_finishes",
            ["name"],
            {
                unique: true,
                name: "unique_finish_name",
            }
        );
  }
};
