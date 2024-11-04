import { DataTypes } from "sequelize";
import sequelize from "../database/sequelizeConfig.js";

export default sequelize.define('supplier_writing_instruction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'id'
    },
    beneficiaryName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'beneficiary_name'
    },
    beneficiaryAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'beneficiary_address'
    },
    beneficiaryPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'beneficiary_phone'
    },
    beneficiaryMobile: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'beneficiary_mobile'
    },
    beneficiaryFax: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'beneficiary_fax'
    },
    bankName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'bank_name'
    },
    bankAddress: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'bank_address'
    },
    bankPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bank_phone'
    },
    bankMobile: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bank_mobile'
    },
    bankFax: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'bank_fax'
    },
    routing: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'routing'
    },
    account: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'account'
    },
    swiftCode: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'swift_code'
    },
    iban: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'iban'
    },
    internalNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'internal_notes'
    },
    supplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'suppliers',
            key: 'supplier_id'
        },
        field: 'supplier_id'
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by'
    },
    updatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'updated_by'
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at'
    }
}, {
    tableName: 'supplier_writing_instruction',
    timestamps: true,
    paranoid: true
});
