module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "product_base_colors",
      [
        {
          id: 1,
          name: "color-1",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "color-2",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "color-3",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: "color-4",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: "color-5",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: "color-6",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("product_base_colors", null, {});
  },
};
