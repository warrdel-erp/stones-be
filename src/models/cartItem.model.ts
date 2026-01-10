import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Account from "./Account.model";
import InventoryProduct from "./inventoryProduct.model";
import Client from "./client.model";
import Location from "./location.model";

const CartItem = sequelize.define(
    "CartItem",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        accountId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Account,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        inventoryProductId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true, // One-to-one relationship: one cart item per inventory product
            references: {
                model: InventoryProduct,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Client,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        },
        locationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Location,
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
    },
    {
        tableName: "cart_items",
        timestamps: true,
    }
);

// Define associations in the model file
CartItem.belongsTo(Account, { foreignKey: "accountId", as: "account" });
CartItem.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });
CartItem.belongsTo(Client, { foreignKey: "clientId", as: "client" });

// Scope configuration for CartItem model
(CartItem as any).scopeConfig = {
    client: true,
    location: true,
};

export default CartItem;

