import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import Truck from "./truck.model";
import { DELIVERY_STATUS } from "../constants/tableTypes";
import Client from "./client.model";
import Location from "./location.model";

const Delivery = sequelize.define(
    "Delivery",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(DELIVERY_STATUS)),
        },
        truckId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Truck,
                key: "id",
            },
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
        clientId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Client,
                key: "id",
            },
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
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
        tableName: "deliveries",
        timestamps: true,
    }
);

// Scope configuration for Delivery model
(Delivery as any).scopeConfig = {
    client: true,
    location: true,
};

export default Delivery; 