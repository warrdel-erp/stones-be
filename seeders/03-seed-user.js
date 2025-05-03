"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          username: "John Doe",
          userid: "user",
          // password: "user",
          password: "$2b$10$IwAT2GAFsLLg9cVN8mK/4OoouEl/Wdz0VsLCsrhvkXaNFmfE8AoV2",
          phone: "+1234567890",
          email: "user@gmail.com",
          clientId: 1,
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
