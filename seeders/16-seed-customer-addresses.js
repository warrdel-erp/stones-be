"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "customer_addresses",
      [
        {
          id: 1,
          address: "WARD NO. 22",
          suit: "NEAR POLICE STATION",
          unit: null,
          city: "Sri Ganganagar",
          state: "Rajasthan",
          zip: "335701",
          countryId: 186,
          contactName: "John Doe",
          contactEmail: "john.doe@example.com",
          contactNumber: "+91-9876543210",
          addressType: "remit",
          customerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          address: "WARD NO. 22",
          suit: "NEAR POLICE STATION",
          unit: null,
          city: "Sri Ganganagar",
          state: "Rajasthan",
          zip: "335701",
          countryId: 186,
          contactName: "Jane Smith",
          contactEmail: "jane.smith@example.com",
          contactNumber: "+91-9876543211",
          addressType: "shipping",
          customerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("customer_addresses", {
      id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] },
    });
  },
};
