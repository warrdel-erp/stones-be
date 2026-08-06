"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("sipls", "s3FileId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "s3_files",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      comment: "Reference to the s3_files record for the SIPL document",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("sipls", "s3FileId");
  },
};
