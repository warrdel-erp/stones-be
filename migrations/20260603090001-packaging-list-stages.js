"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // write a code to update enum of packaging_list enum of stage

    await queryInterface.changeColumn("packaging_lists", "stage", {
      type: Sequelize.ENUM("initiated", "loadingOrder", "invoiced"),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // write a code to update enum of packaging_list enum of stage
    // from
    //   export const PACKAGING_LIST_STAGES = {
    //   INITIATED: "initiated",
    //   LOADING_ORDER: "loadingOrder",
    //   INVOICED: "invoiced",
    //   DISPATCHED: "dispatched",
    // } as const;
    // to
    //   export const PACKAGING_LIST_STAGES = {
    //   INITIATED: "initiated",
    //   LOADING_ORDER: "loadingOrder",
    //   INVOICED: "invoiced",
    // } as const;
    await queryInterface.changeColumn("packaging_lists", "stage", {
      type: Sequelize.ENUM("initiated", "packagingList", "invoiced"),
      allowNull: false,
    });
  },
};
