module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "bins",
      [
        { id: 1, name: "Bin A1", warehouseId: 1 },
        { id: 2, name: "Bin A2", warehouseId: 1 },
        { id: 3, name: "Bin B1", warehouseId: 2 },
        { id: 4, name: "Bin B2", warehouseId: 2 },
        { id: 5, name: "Bin C1", warehouseId: 3 },
        { id: 6, name: "Bin C2", warehouseId: 3 },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("bins", null, {});
  },
};
