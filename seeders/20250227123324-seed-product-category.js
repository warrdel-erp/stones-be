module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert("product_category", [
      {
        id: 1,
        name: "Slab",
        clientId: 1,
        isSlabType: true,
      },
      {
        id: 2,
        name: "Table",
        clientId: 1,
        isSlabType: false,
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete("product_category", null, {});
  },
};
