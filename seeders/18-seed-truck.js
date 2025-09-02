"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "trucks",
      [
        {
          id: 2,
          registrationNumber: "RJ13SF1234",
          name: "Truck-2",
          registrationDate: "2025-05-14",
          capacity: 100,
          vehicleType: "medium",
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 1,
          registrationNumber: "RJ13SF4045",
          name: "Truck - 1",
          registrationDate: "2025-05-08",
          capacity: 400,
          vehicleType: "heavy",
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("trucks", {
      id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] },
    });
  },
};
