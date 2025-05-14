"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "products",
      [
        {
          id: 1,
          name: "Kota Stone 1",
          alternativeName: "kota-stone-1",
          subCategoryId: 2,
          baseColorId: 3,
          groupId: 3,
          finishId: 3,
          status: "active",
          origin: 2,
          uom: 1,
          kind: 1,
          weight: 10.5,
          thickness: 2.5,
          notes: "High quality granite slab",
          specialInstruction: "Handle with care",
          disclaimer: "Color may vary slightly",
          categoryId: 1,
          singleSlabPrice: 12,
          bundlePrice: 10,
          reorderQuantity: 43,
          safetyQuantity: 43,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          inventoryLinkAccountId: 4,
          incomeAccountId: 7,
          costOfGoodsAccountId: 6,
        },
        {
          id: 2,
          name: "Kota Stone 2",
          alternativeName: "kota-stone-2",
          subCategoryId: 1,
          baseColorId: 1,
          groupId: 1,
          finishId: 1,
          status: "active",
          origin: 1,
          uom: 1,
          kind: 1,
          weight: 10.5,
          thickness: 2.5,
          notes: "High quality granite slab",
          specialInstruction: "Handle with care",
          disclaimer: "Color may vary slightly",
          categoryId: 1,
          singleSlabPrice: 12,
          bundlePrice: 10,
          reorderQuantity: 43,
          safetyQuantity: 43,
          createdBy: 1,
          updatedBy: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          inventoryLinkAccountId: 4,
          incomeAccountId: 7,
          costOfGoodsAccountId: 6,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("products", {
      id: { [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6] },
    });
  },
};
