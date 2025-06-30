"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "customer_addresses",
      [
        {
          id: 1,
          address: "350 5th Ave, New York, NY 10118, USA",
          unit: null,
          contactName: "John Doe",
          contactEmail: "john.doe@example.com",
          contactNumber: "+91-9876543210",
          lat: 40.748817,
          long: -73.985428,
          addressType: "remit",
          customerId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          address: "1600 Amphitheatre Parkway, Mountain View, CA 94043, USA",
          unit: null,
          contactName: "Jane Smith",
          contactEmail: "jane.smith@example.com",
          contactNumber: "+91-9876543211",
          lat: 37.4220656,
          long: -122.0840897,
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
