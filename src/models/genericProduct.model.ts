import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";
import Product from "./product.model";
import SIPL from "./sipl.model";
import InventoryProduct from "./inventoryProduct";
import SIPLProduct from "./siplProduct";
import { INVENTORY_ITEM_STATUS } from "../constants";

const GenericProduct = sequelize.define(
    "GenericProduct",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        barcode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        landedUnitCost: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        isHold: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        createdById: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        updatedById: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Product,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        siplId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: SIPL,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        inventoryProductId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: InventoryProduct,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
        status: {
            type: DataTypes.ENUM(...Object.values(INVENTORY_ITEM_STATUS)),
            allowNull: true,
            defaultValue: INVENTORY_ITEM_STATUS.INITIATE,
        },
        siplProductId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: SIPLProduct,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        },
    },
    {
        tableName: "generic_products",
        timestamps: true,
    }
);

export default GenericProduct; 