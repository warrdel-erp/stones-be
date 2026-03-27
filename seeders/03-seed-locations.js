export default {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert("locations", [
      {
        id: 1,
        locationName: "Atlanta Office",
        address: "3045 Business Park Drive Suite A, Norcross, GA 30071, United States",
        status: "active",
        contactName: "John Doe",
        contactNumber: "9876543210",
        contactMail: "johndoe@example.com",
        locationCode: "ATL",
        lat: 33.96229021303256,
        long: -84.20082993409449,
        createdAt: new Date(),
        updatedAt: new Date(),
        clientId: 1,
      },
      {
        id: 2,
        locationName: "San Francisco HQ",
        locationCode: "SNF",
        address: "456 Market St",
        status: "active",
        contactName: "Alice Smith",
        contactNumber: "9123456789",
        contactMail: "alice.smith@example.com",
        lat: 37.774929,
        long: -122.419418,
        createdAt: new Date(),
        updatedAt: new Date(),
        clientId: 1,
      },
      {
        id: 3,
        locationName: "Chicago Office",
        locationCode: "CHG",
        address: "789 Michigan Avenue, Chicago, IL",
        status: "inactive",
        contactName: "Michael Johnson",
        contactNumber: "9988776655",
        contactMail: "michael.johnson@example.com",
        lat: 41.878113,
        long: -87.629799,
        createdAt: new Date(),
        updatedAt: new Date(),
        clientId: 1,
      },
    ]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete("locations", {}, {});
  },
};
