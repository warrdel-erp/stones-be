module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "warehouses",
      [
        { id: 1, locationId: 1, clientId: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: 2, locationId: 2, clientId: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: 3, locationId: 3, clientId: 1, createdAt: new Date(), updatedAt: new Date() },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("warehouses", null, {});
  },
};
