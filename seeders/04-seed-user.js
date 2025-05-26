"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          username: "Chris Evans",
          userid: "user",
          phone: "+1234567890",
          clientId: 1,
          accountId: 2,
          defaultLocationId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", {
      id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] },
    });
  },
};
