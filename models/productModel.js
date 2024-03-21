import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';

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
        unique: true,
        field: 'product_name'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    baseColor: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'base_color'
    },
    origin :{
        type: DataTypes.STRING,
        allowNull: true
    },
    category :{
        type: DataTypes.STRING,
        allowNull: true
    },
    alternativeName :{
        type: DataTypes.STRING,
        allowNull: true,
        field: 'alternative_name'
    },
    kind :{
        type: DataTypes.STRING,
        allowNull: true
    },
    subCategory:{
        type: DataTypes.STRING,
        allowNull: true,
        field: 'sub_category'
    },
    groupsAll:{
        type: DataTypes.STRING,
        allowNull: true,
        field: 'groups_all'
    },
    finish:{
        type: DataTypes.STRING,
        allowNull: true
    },
    thickness:{
        type: DataTypes.STRING,
        allowNull: true
    },
    serialName:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'serial_name'
    },
    uomGroup:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'uom_group'
    },
    weight:{
        type: DataTypes.STRING,
        allowNull: true
    },
    singleSlab:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'single_slab'
    },
    bundle:{
        type: DataTypes.STRING,
        allowNull: true
    },
    priceRange:{
        type: DataTypes.STRING,
        allowNull: true,
        field: 'price_range'
    },
    glInventoryLinkAccount:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'gl_inventory_link_account'
    },
    glIncomeAccount:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'gl_income_account'
    },
    glCostGoodsAccount:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'gl_cost_goods_account'
    },
    safetyStock:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'safety_stock'
    },
    reorderQunity:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'reorder_quantity'
    },
    leadTime:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'lead_time'
    },
    assignedTime:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'assigned_time'
    },
    preferredSupplier:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'preferred_supplier'
    },
    manufacture:{
        type: DataTypes.STRING,
        allowNull: true
    },
    purchaseUnit:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'purchase_unit'
    },
    quantity:{
        type: DataTypes.STRING,
        allowNull: true
    },
    supplierProduct:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'supplier_product'
    },
    supplierSku:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'supplier_sku'
    },
    avrEstimateCost:{
        type: DataTypes.STRING,
        allowNull: true,
        field:'avr_estimate_cost'
    },
    notes:{
        type: DataTypes.STRING,
        allowNull: true
    },
    instructions:{
        type: DataTypes.STRING,
        allowNull: true
    },
    disclaimer:{
        type: DataTypes.STRING,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field:'created_at'
    },
    updatedAt: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field:'updated_at'
    },
    deletedAt: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        field:'deleted_at'
    },
},  
{
    tableName: 'products',
    timestamps: true,
}
)
