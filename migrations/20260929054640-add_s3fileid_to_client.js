'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 's3FileId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 's3_files',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('clients', 's3FileId');
  }
};
