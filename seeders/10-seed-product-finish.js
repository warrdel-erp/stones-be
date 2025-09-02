const { update } = require("lodash");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "product_finishes",
      [
        {
          id: 1,
          name: "Finish-1",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Finish-2",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "Finish-3",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: "Finish-4",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: "Finish-5",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: "Finish-6",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_finishes", null, {});
  },
};
