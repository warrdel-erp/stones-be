"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "clients",
      [
        {
          id: 1,
          firstName: "Ethan",
          lastName: "Sterling",
          phone: "9876876541",
          userCount: 10,
          accountId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("clients", {
      id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] },
    });
  },
};
