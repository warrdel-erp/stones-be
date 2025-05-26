"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "companies",
      [
        {
          id: 1,
          companyName: "Tech Solutions Inc.",
          companyAddress: "456 Innovation Drive, Suite 800",
          city: "San Francisco",
          state: "California",
          country: "USA",
          zipCode: "94107",
          contactPersonName: "Ethan Sterling",
          contactMobile: "+14155552671",
          email: "contact@techsolutions.com",
          clientId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("companies", {
      id: { [Sequelize.Op.in]: [1] },
    });
  },
};
