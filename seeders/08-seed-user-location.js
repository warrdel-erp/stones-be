"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "user_locations",
      [
        {
          userId: 1,
          locationId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 1,
          locationId: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          userId: 1,
          locationId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("user_locations", {
      id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] },
    });
  },
};
