module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "product_groups",
      [
        {
          id: 1,
          name: "Group-1",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: "Group-2",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          name: "Group-3",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          name: "Group-4",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          name: "Group-5",
          createdBy: 1,
          updatedBy: 1,
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 6,
          name: "Group-6",
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
    await queryInterface.bulkDelete("product_groups", null, {});
  },
};
