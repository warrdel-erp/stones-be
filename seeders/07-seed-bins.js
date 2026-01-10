module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "bins",
      [
        {
          id: 1,
          locationId: 1,
          name: "Bin A1",
          warehouseId: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          locationId: 1,
          name: "Bin A2",
          warehouseId: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          locationId: 1,
          name: "Bin B1",
          warehouseId: 2,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          locationId: 1,
          name: "Bin B2",
          warehouseId: 2,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          locationId: 1,
          name: "Bin C1",
          warehouseId: 3,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          locationId: 1,
          name: "Bin C2",
          warehouseId: 3,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("bins", null, {});
  },
};
