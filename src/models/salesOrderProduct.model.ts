import { DataTypes } from "sequelize";
import { sequelize } from "../config/database";
import InventoryProduct from "./inventoryProduct.model";
import LoadingOrder from "./loadingOrder.model";
import PackagingList from "./packagingList.model";
import SalesOrder from "./salesOrder.model";
import Client from "./client.model";
import * as models from "./index";
import { SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";
import { convertSqrInchToFt, getPercentageValue } from "../helper";

import * as decimals from '../helper/decimal'

const SalesOrderProduct = sequelize.define(
  "sales_order_products",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    isSlabType: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    taxPercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0,
    },
    taxApplied: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: false,
    },
    picked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    loRemeasureLength: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    loRemeasureWidth: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    plRemeasureLength: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    plRemeasureWidth: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    receivingAreaSqFt: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    stage: {
      type: DataTypes.ENUM(...Object.values(SALE_ORDER_PRODUCT_STAGES)), // Sales Order, Loading Order, Packaging List, Invoiced
      allowNull: false,
      defaultValue: SALE_ORDER_PRODUCT_STAGES.SALES_ORDER,
    },
    inventoryProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: InventoryProduct,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    salesOrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SalesOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    packagingListId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: PackagingList,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    loadingOrderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: LoadingOrder,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    loSqrFt: {
      type: DataTypes.VIRTUAL,
      get() {
        const length = Number(this.get("loRemeasureLength")) || 0;
        const width = Number(this.get("loRemeasureWidth")) || 0;

        const area = decimals.decimalMultiply(length, width);

        return convertSqrInchToFt(area);
      }
    },
    plSqrFt: {
      type: DataTypes.VIRTUAL,
      get() {
        const length = Number(this.get("plRemeasureLength")) || 0;
        const width = Number(this.get("plRemeasureWidth")) || 0;

        const area = decimals.decimalMultiply(length, width);

        return convertSqrInchToFt(area);
      }
    },
    finalSqrFt: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.get("plSqrFt") || this.get("loSqrFt");
      }
    },
    amount: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.get("isSlabType")) {
          return decimals.decimalMultiply(Number(this.get("receivingAreaSqFt")) || 0, Number(this.get("unitPrice")) || 0);
        }
        return Number(this.get("unitPrice")) || 0;
      },
    },
    loAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.get("isSlabType")) {
          const area = Number(this.get("loSqrFt"))
          const areaWithPrice = decimals.decimalMultiply(area, Number(this.get("unitPrice")) || 0);
          return areaWithPrice
        }
        return Number(this.get("unitPrice")) || 0;
      },
    },
    plAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.get("isSlabType")) {
          const area = Number(this.get("plSqrFt"))
          const areaWithPrice = decimals.decimalMultiply(area, Number(this.get("unitPrice")) || 0);
          return areaWithPrice;
        }
        return Number(this.get("unitPrice")) || 0;
      },
    },
    loTaxAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        const amount = Number(this.get("loAmount")) || 0;
        const percentage = Number(this.get("taxPercentage")) || 0;
        const multiplied = decimals.decimalMultiply(amount, percentage);
        return decimals.decimalDivide(multiplied, 100);
      },
    },
    plTaxAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        const amount = Number(this.get("plAmount")) || 0;
        const percentage = Number(this.get("taxPercentage")) || 0;
        const multiplied = decimals.decimalMultiply(amount, percentage);
        return decimals.decimalDivide(multiplied, 100);
      },
    },
    taxAmount: {
      type: DataTypes.VIRTUAL,
      get() {
        const amount = Number(this.get("amount")) || 0;
        const percentage = Number(this.get("taxPercentage")) || 0;
        const multiplied = decimals.decimalMultiply(amount, percentage);
        return decimals.decimalDivide(multiplied, 100);
      },
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
        model: models.Location,
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    requirementLineId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "requirement_line_id",
      references: {
        model: "sales_order_requirement_lines",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
  },
  {
    tableName: "sales_order_products",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["salesOrderId", "inventoryProductId"],
      },
    ],
  }
);

// Scope configuration for SalesOrderProduct model
(SalesOrderProduct as any).scopeConfig = {
  client: true,
  location: true,
};

export default SalesOrderProduct;

// hook to prevent update salesOrderId and inventoryProductId
SalesOrderProduct.beforeUpdate((product: any) => {
  delete product.dataValues.salesOrderId;
  // delete product.dataValues.inventoryProductId;
});