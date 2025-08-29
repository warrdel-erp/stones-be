"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("products", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      alternativeName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      inventoryLinkAccountId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ledger_accounts",
          key: "id",
        },
      },
      incomeAccountId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ledger_accounts",
          key: "id",
        },
      },
      costOfGoodsAccountId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "ledger_accounts",
          key: "id",
        },
      },
      baseColorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "product_base_colors",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "product_groups",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      origin: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      uom: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      finishId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "product_finishes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      kind: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      thickness: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      specialInstruction: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      disclaimer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      isSlabType: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      singleUnitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      bundlePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      reorderQuantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      safetyQuantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      binId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "bins",
          key: "id",
        },
        onDelete: "NO ACTION",
        onUpdate: "CASCADE",
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      updatedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
      subCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "product_sub_categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("products");
  },
};
