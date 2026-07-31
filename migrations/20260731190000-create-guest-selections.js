"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add qrCode column to clients table if it doesn't exist
    const clientTableDescription = await queryInterface.describeTable("clients");
    if (!clientTableDescription.qrCode) {
      await queryInterface.addColumn("clients", "qrCode", {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: true,
      });

      // Backfill UUID for existing clients
      const [clients] = await queryInterface.sequelize.query('SELECT id FROM clients WHERE qrCode IS NULL OR qrCode = ""');
      for (const client of clients) {
        await queryInterface.sequelize.query(
          `UPDATE clients SET qrCode = UUID() WHERE id = ${client.id}`
        );
      }
    }

    // 2. Create guest_selections table
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("guest_selections")) {
      await queryInterface.createTable("guest_selections", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        clientId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "clients",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        guestName: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        guestMobile: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        guestEmail: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        choiceDescription: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM("pending", "reviewed", "converted", "cancelled"),
          allowNull: false,
          defaultValue: "pending",
        },
        submittedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      });
    }

    // 3. Create guest_selection_items table
    if (!tables.includes("guest_selection_items")) {
      await queryInterface.createTable("guest_selection_items", {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        guestSelectionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "guest_selections",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        inventoryProductId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "inventory_products",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
        },
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("guest_selection_items");
    await queryInterface.dropTable("guest_selections");
    // Optionally remove qrCode column from clients
  },
};
