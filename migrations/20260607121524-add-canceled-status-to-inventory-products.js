'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`ALTER TABLE inventory_products MODIFY COLUMN status ENUM('INITIATE', 'IN_INVENTORY', 'ALLOCATED', 'SOLD', 'BROKEN', 'CANCELED') DEFAULT 'INITIATE'`);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`ALTER TABLE inventory_products MODIFY COLUMN status ENUM('INITIATE', 'IN_INVENTORY', 'ALLOCATED', 'SOLD', 'BROKEN') DEFAULT 'INITIATE'`);
  }
};
