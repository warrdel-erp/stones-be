module.exports = {
  async up(queryInterface) {
    return queryInterface.bulkInsert("product_category", [
      {
        id: 1,
        name: "Slab",
        isSlabType: true,
      },
      {
        id: 2,
        name: "Table",
        isSlabType: false,
      },
    ]);
  },

  async down(queryInterface) {
    return queryInterface.bulkDelete("product_category", null, {});
  },
};
