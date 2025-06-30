export default {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert("locations", [
      {
        id: 1,
        location: "New York Office",
        address: "123 Main St, Floor 5",
        status: "active",
        contactName: "John Doe",
        contactNumber: "9876543210",
        contactMail: "johndoe@example.com",
        lat: 40.712776,
        long: -74.005974,
        createdAt: new Date(),
        updatedAt: new Date(),
        clientId: 1,
      },
      {
        id: 2,
        location: "San Francisco HQ",
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
        location: "London Office",
        address: "789 Oxford Street",
        status: "inactive",
        contactName: "Michael Johnson",
        contactNumber: "9988776655",
        contactMail: "michael.johnson@example.com",
        lat: 51.515419,
        long: -0.141099,
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
