"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "accounts",
      [
        {
          id: 1,
          // Password: "SecurePass123",
          password: "$2b$10$fwn9yJLoj7CJ9WkKVUMYkeXKRbe1/P/Vhs3yjzXVdhr/CwQJ1IdCC",
          email: "contact1@techsolutions.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          // password: "user",
          password: "$2b$10$IwAT2GAFsLLg9cVN8mK/4OoouEl/Wdz0VsLCsrhvkXaNFmfE8AoV2",
          email: "user@gmail.com",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("accounts", {
      id: { [Sequelize.Op.in]: [1, 2] },
    });
  },
};
