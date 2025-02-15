import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { productKindEnum, productAssignedBinEnum, productCategoryEnum, productColoursEnum, productOriginEnum, productPriceRangeEnum, productTypeEnum, productUomEnum, status } from '../constant.js';
import Supplier from '../models/supplierModel.js'

export default sequelize.define(
    'products',
    {
        productId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'product_id'
        },
        productName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'product_name'
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        baseColor: {
            type: DataTypes.ENUM(...productColoursEnum),
            allowNull: true,
            field: 'base_color'
        },
        origin: {
            type: DataTypes.ENUM(...productOriginEnum),
            allowNull: true
        },
        category: {
            type: DataTypes.ENUM(...productCategoryEnum),
            allowNull: true
        },
        alternativeName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'alternative_name'
        },
        kind: {
            type: DataTypes.ENUM(...productKindEnum),
            allowNull: false,
        },
        subCategory: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'sub_category'
        },
        groupsAll: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'groups_all'
        },
        finish: {
            type: DataTypes.STRING,
            allowNull: true
        },
        thickness: {
            type: DataTypes.STRING,
            allowNull: true
        },
        serialName: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'serial_name'
        },
        uomGroup: {
            type: DataTypes.ENUM(...productUomEnum),
            allowNull: false,
            field: 'uom_group'
        },
        weight: {
            type: DataTypes.STRING,
            allowNull: true
        },
        productMfgSupplier: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'p_mfg_not_supplier'
        },
        genericProduct: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'generic_product'
        },
        customerSelectSlab: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'customer_select_slab'
        },
        nonSerialized: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'non_serialized'
        },
        invisible: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            field: 'invisible'
        },
        singleSlab: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'single_slab'
        },
        bundle: {
            type: DataTypes.STRING,
            allowNull: true
        },
        priceRange: {
            type: DataTypes.ENUM(...productPriceRangeEnum),
            allowNull: true,
            field: 'price_range'
        },
        glInventoryLinkAccount: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'gl_inventory_link_account'
        },
        glIncomeAccount: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'gl_income_account'
        },
        glCostGoodsAccount: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'gl_cost_goods_account'
        },
        safetyStock: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'safety_stock'
        },
        reorderQunity: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'reorder_quantity'
        },
        leadTime: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'lead_time'
        },
        assignedTime: {
            type: DataTypes.ENUM(...productAssignedBinEnum),
            allowNull: true,
            field: 'assigned_time'
        },
        preferredSupplier: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'preferred_supplier'
        },
        manufacture: {
            type: DataTypes.STRING,
            allowNull: true
        },
        purchaseUnit: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'purchase_unit'
        },
        quantity: {
            type: DataTypes.STRING,
            allowNull: true
        },
        supplierProduct: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'supplier_product'
        },
        supplierSku: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'supplier_sku'
        },
        avrEstimateCost: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'avr_estimate_cost'
        },
        notes: {
            type: DataTypes.STRING,
            allowNull: true
        },
        instructions: {
            type: DataTypes.STRING,
            allowNull: true
        },
        disclaimer: {
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            field: 'updated_at'
        },
        createdBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'created_by',
        },
        updatedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'updated_by',
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at',
        },
        status: {
            type: DataTypes.ENUM(...status),
            allowNull: false,
            defaultValue: 'ACTIVE' // Default value is 'active'
        },
    },
    {
        tableName: 'products',
        timestamps: true,
        paranoid: true,
    }
)
