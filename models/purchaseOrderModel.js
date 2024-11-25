import sequelize from "../database/sequelizeConfig.js"
import { DataTypes } from 'sequelize';
import { purchaseStatus, deliveryType, shipmentTerm, freightForwarder, otherCharges } from "../constant.js";
import Suppliers from './supplierModel.js'
import Locations from './locationModel.js'


export default sequelize.define(
    'purchase_orders',
    {
        purchaseOrderId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'purchase_order_id',
        },
        po: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // unique: true,
        },
        poDate: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'po_date',
        },
        supplierSo: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'supplier_so',
        },
        requiredShipDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'required_ship_date',
        },
        etaDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'eta_date',
        },
        poExpireDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'po_expire_date',
        },
        container: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        deliveryDate: {
            type: DataTypes.ENUM(...deliveryType),
            allowNull: true,
            field: 'delivery_date',
        },
        shipmentTerms: {
            type: DataTypes.ENUM(...shipmentTerm),
            allowNull: true,
            field: 'shipment_terms'
        },
        paymentTerm: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'payment_term',
        },
        freightForwarder: {
            type: DataTypes.ENUM(...freightForwarder),
            allowNull: true,
            field: 'freight_forwarder',
        },
        vessel: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        airBill: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'air_bill',
        },
        plannedExFactoryDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'planned_ex_factorydate'
        },
        exFactoryDate: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'ex_factorydate'
        },
        departurePort: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'departure_port',
        },
        etdPort: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'etd_port'
        },
        arrivalPort: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'arrival_port'
        },
        etaPort: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'eta_port'
        },
        dischargePort: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'discharge_port'
        },
        wiringInstruction: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'wiring_instruction'
        },
        printedNotes: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'printed_notes'
        },
        internalNotes: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'internal_notes'
        },
        specialInstruction: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'special_instruction'
        },
        poTermSelect: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'po_term_select'
        },
        notes: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        otherCharges: {
            type: DataTypes.ENUM(...otherCharges),
            allowNull: true,
            field: 'other_charges',
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'account_number'
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            field: 'description'
        },
        charge: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(...purchaseStatus),
            allowNull: false,
            defaultValue: 'OPEN' // Default value is 'open'
        },
        supplierId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'supplier_id',
            references: {
                model: Suppliers,
                key: 'supplier_id'
            }
        },
        purchaseLocationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'purchase_location_id',
            references: {
                model: Locations,
                key: 'location_id'
            }
        },
        locationId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'location_id',
            references: {
                model: Locations,
                key: 'location_id'
            }
        },
        purchaseOrderStatus: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
                max: 100,
            },
            field: "purchase_order_status",
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
            field: 'deleted_at'
        }
    },
    {
        tableName: 'purchase_orders',
        timestamps: true,
        paranoid: true,
    }
)
