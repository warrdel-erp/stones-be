"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("opportunities")) {
      await queryInterface.createTable("opportunities", {
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
          onDelete: "CASCADE",
        },
        createdById: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "accounts",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        customerId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "customers",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "RESTRICT",
        },
        contactPerson: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        phone: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        projectName: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        endCustomerName: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        opportunityName: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        opportunityType: {
          type: Sequelize.STRING(255),
          allowNull: true,
          defaultValue: "New Requirement",
        },
        priority: {
          type: Sequelize.STRING(255),
          allowNull: true,
          defaultValue: "Normal",
        },
        expectedDecisionDate: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        leadSource: {
          type: Sequelize.STRING(255),
          allowNull: true,
          defaultValue: "WhatsApp",
        },
        estimatedValue: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
        },
        salespersonId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "accounts",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        team: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        referralBy: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        followUpDate: {
          type: Sequelize.DATEONLY,
          allowNull: true,
        },
        followUpAction: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        assignedToId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "accounts",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        createReminder: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        status: {
          type: Sequelize.STRING(255),
          allowNull: false,
          defaultValue: "OPEN",
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

  down: async (queryInterface) => {
    await queryInterface.dropTable("opportunities");
  },
};
