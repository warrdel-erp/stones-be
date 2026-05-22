"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("file_uploads", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uuid: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true,
        comment: "UUID used as the S3 object key segment",
      },
      s3Key: {
        type: Sequelize.STRING(512),
        allowNull: false,
        comment: "Full S3 object key e.g. uploads/{clientId}/{uuid}",
      },
      s3Bucket: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      entityType: {
        type: Sequelize.ENUM(
          "customer",
          "vendor",
          "product",
          "salesOrder",
          "purchaseOrder",
          "sipl",
          "inventoryProduct",
          "loadingOrder",
          "payment",
          "bill"
        ),
        allowNull: true,
        comment: "The entity this file is associated with",
      },
      entityId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "The ID of the associated entity (no FK constraint)",
      },
      companyId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Business-level company ID (mirrors clientId, kept for spec compliance)",
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
      originalName: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      mimeType: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: false,
        comment: "File size in bytes",
      },
      status: {
        type: Sequelize.ENUM("pending", "active", "failed"),
        allowNull: false,
        defaultValue: "pending",
      },
      uploadedById: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "accounts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    await queryInterface.addIndex("file_uploads", ["clientId"], {
      name: "idx_file_uploads_clientId",
    });

    await queryInterface.addIndex("file_uploads", ["entityType", "entityId"], {
      name: "idx_file_uploads_entity",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("file_uploads");
  },
};
