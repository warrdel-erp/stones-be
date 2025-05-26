"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "product_sub_category",
      [
        { id: 1, name: "GRANITE", categoryId: 1 },
        { id: 2, name: "LIMESTONE", categoryId: 1 },
        { id: 3, name: "MARBLE", categoryId: 1 },
        { id: 4, name: "QUARTZ", categoryId: 1 },
        { id: 5, name: "QUARTZITE", categoryId: 1 },
        { id: 6, name: "SOAPSTONE", categoryId: 1 },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_sub_category", {
      id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] },
    });
  },
};
