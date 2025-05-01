"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "clients",
      [
        {
          id: 1,
          name: "Tech Solutions Ltd 1",
          // Password: "SecurePass123",
          password: "$2b$10$fwn9yJLoj7CJ9WkKVUMYkeXKRbe1/P/Vhs3yjzXVdhr/CwQJ1IdCC",
          email: "contact1@techsolutions.com",
          locationShortName: "TSL",
          clientType: "Enterprise",
          address: "456 Innovation Drive, Suite 800",
          country: "USA",
          city: "San Francisco",
          pincode: "94107",
          tax: "GST987654",
          priceLevel: "Gold",
          paymentTerms: "Net 45",
          licenseNumber: "LIC-567890",
          userCount: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("clients", {
      id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] },
    });
  },
};
