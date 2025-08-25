"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "product_sub_category",
      [
        { id: 1, name: "GRANITE", isSlabType: true, clientId: 1 },
        { id: 2, name: "LIMESTONE", isSlabType: true, clientId: 1 },
        { id: 3, name: "MARBLE", isSlabType: true, clientId: 1 },
        { id: 4, name: "QUARTZ", isSlabType: true, clientId: 1 },
        { id: 5, name: "QUARTZITE", isSlabType: true, clientId: 1 },
        { id: 6, name: "SOAPSTONE", isSlabType: true, clientId: 1 },
        { id: 7, name: "Table", isSlabType: false, clientId: 1 },
        { id: 8, name: "Cup", isSlabType: false, clientId: 1 },
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
