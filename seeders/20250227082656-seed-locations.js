export default {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert("locations", [
      {
        id: 1,
        location: "New York Office",
        address: "123 Main St, Floor 5",
        suite: "Suite 501",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "USA",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        location: "San Francisco HQ",
        address: "456 Market St",
        suite: null,
        city: "San Francisco",
        state: "CA",
        zip: "94103",
        country: "USA",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        location: "London Office",
        address: "789 Oxford Street",
        suite: null,
        city: "London",
        state: "England",
        zip: "W1D 1BS",
        country: "UK",
        status: "inactive",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete("locations", {}, {});
  },
};
