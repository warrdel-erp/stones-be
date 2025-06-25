import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import User from "./user.model";
import SalesOrderInvoice from "./salesOrderInvoice.model";
import { AppError } from "../helper/appError";
import Client from "./client.model";

const RETURN_STATUS = {
    INITIATED: "initiated",
    COMPLETE: "complete",
    CANCELLED: "canceled"
} as const;

const Return = sequelize.define(
    "Return",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING
        },
        roInvoiceNumber: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.ENUM(...Object.values(RETURN_STATUS)),
            allowNull: false,
            defaultValue: RETURN_STATUS.INITIATED,
        },
        invoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: SalesOrderInvoice,
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
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
        clientId: {
            type: DataTypes.INTEGER,
            references: {
                model: Client,
                key: "id",
            },
            onDelete: "RESTRICT",
            onUpdate: "CASCADE",
        },
    },
    {
        tableName: "returns",
        indexes: [
            {
                unique: true,
                fields: ["roInvoiceNumber", "invoiceId"],
            },
        ],
        timestamps: true,
    }
);

// Hook: Auto-Generate return code based on invoice
Return.beforeCreate(async (returnRecord: any) => {
    if (!returnRecord.invoiceId) {
        throw new AppError("Invoice ID is required to generate return code.", 400);
    }

    // Get the invoice to access its number
    const invoice: any = await SalesOrderInvoice.findByPk(returnRecord.invoiceId);
    if (!invoice) {
        throw new AppError("Invoice not found.", 404);
    }

    // Find the last return for this invoice to get the next return number
    const lastReturnForInvoice: any = await Return.findOne({
        where: { invoiceId: returnRecord.invoiceId },
        order: [["id", "DESC"]],
    });

    const returnNumber = lastReturnForInvoice ? lastReturnForInvoice.roInvoiceNumber + 1 : 1; // First return is 1, subsequent returns increment

    const invoiceNumber = invoice.invoiceCode.split(' ')[1];

    // Generate code in format: "RET {invoiceNumber}-{returnNumber}"
    returnRecord.roInvoiceNumber = returnNumber;
    returnRecord.code = `RO ${invoiceNumber}-${returnNumber}`;
});

export { RETURN_STATUS };
export default Return; 