module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "warehouses",
      [
        { id: 1, locationId: 1 },
        { id: 2, locationId: 2 },
        { id: 3, locationId: 3 },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("warehouses", null, {});
  },
};
