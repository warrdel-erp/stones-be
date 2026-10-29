'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

        await queryInterface.removeIndex(
            "product_base_colors",
            "name"
        );
        
        await queryInterface.addIndex(
            "product_base_colors",
            ["name", "clientId"],
            {
                unique: true,
                name: "unique_base_color_per_client",
            }
        );
  },

  async down (queryInterface, Sequelize) {
    
        await queryInterface.removeIndex(
            "product_base_colors",
            "unique_base_color_per_client"
        );

        await queryInterface.addIndex(
            "product_base_colors",
            ["name"],
            {
                unique: true,
                name: "unique_base_color_name",
            }
        );
  }
};
