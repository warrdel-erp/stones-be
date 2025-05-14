"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "customers",
      [
        {
          id: 1,
          status: "active",
          name: "Customer-1",
          type: "Retail",
          contactName: "Customer-1",
          printName: "Customer-1",
          primaryPhoneNumber: "09119136857",
          secondaryPhoneNumber: null,
          landlineNumber: null,
          accEmail: "jkgoyal85@gmail.com",
          email: "jkgoyal85@gmail.com",
          priceLevel: null,
          taxExempt: false,
          salesTax: 10,
          paymentTerms: 2,
          exemptCerti: null,
          internalNotes: null,
          poRequired: false,
          applyFinanceCharges: true,
          preferredDocSend: null,
          daysForGrace: null,
          daysForHold: null,
          customerSince: new Date(),
          einNumber: null,
          reason: null,
          scope: 1,
          pSalesPerson: null,
          createdBy: 1,
          updatedBy: 1,
          updatedAt: new Date(),
          createdAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("customers", {
      id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] },
    });
  },
};
