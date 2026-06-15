import { Op } from "sequelize";
import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as decimals from "../helper/decimal";
import * as models from "../models";
import { scoped } from "../utils/scoped";
import { SALE_ORDER_PRODUCT_STAGES } from "../constants/tableTypes";

export const getTotalSlabMetricByCategory = async (clientId: number) => {
    const rows = await inventoryProductRepository.getInStockProductsWithSubCategory(clientId);

    const slabCategoryMap: { [key: string]: number } = {};
    const genericCategoryMap: { [key: string]: number } = {};

    let totalSlabCount = 0;
    let totalGenericCount = 0;

    for (const row of rows as any[]) {
        const subCategoryName = row.categoryName || "Other";
        const isSlab = row.isSlabType === 1 || row.isSlabType === true;
        const count = Number(row.count) || 0;

        if (isSlab) {
            slabCategoryMap[subCategoryName] = (slabCategoryMap[subCategoryName] || 0) + count;
            totalSlabCount += count;
        } else {
            genericCategoryMap[subCategoryName] = (genericCategoryMap[subCategoryName] || 0) + count;
            totalGenericCount += count;
        }
    }

    const slabs = Object.keys(slabCategoryMap).map(name => {
        const count = slabCategoryMap[name];
        const value = totalSlabCount > 0 ? Math.round((count / totalSlabCount) * 100) : 0;
        return { name, value, count };
    });

    const generics = Object.keys(genericCategoryMap).map(name => {
        const count = genericCategoryMap[name];
        const value = totalGenericCount > 0 ? Math.round((count / totalGenericCount) * 100) : 0;
        return { name, value, count };
    });

    return {
        slabs,
        generics
    };
};

export const getEstimatedRevenue = async (clientId: number) => {
    const salesOrderProducts = await salesOrderProductRepository.getInvoicedProductsForRevenue(clientId);

    // Decimals
    let totalSoldAmount = 0;
    let totalLandedCost = 0;

    for (const sop of salesOrderProducts) {
        const amount = Number(sop.get("amount")) || 0;
        let landedCost = 0;

        const inventoryProduct = (sop as any).inventoryProduct;
        if (inventoryProduct) {
            landedCost = Number(inventoryProduct.assetValue) || 0;
        }

        totalSoldAmount = decimals.decimalAdd(totalSoldAmount, amount);
        totalLandedCost = decimals.decimalAdd(totalLandedCost, landedCost);
    }

    const estimatedRevenue = decimals.decimalSubtract(totalSoldAmount, totalLandedCost);

    return {
        totalSoldAmount,
        totalLandedCost,
        estimatedRevenue
    };
};

export const getMonthlyProfitStats = async (clientId: number) => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 10, 1, 0, 0, 0, 0);

    // 1. Fetch sales order products with stage INVOICED within range, including inventory product, slab, packagingList, and salesOrderInvoice
    const salesOrderProducts = await scoped(models.SalesOrderProduct.unscoped()).findAll({
        where: {
            clientId,
            stage: SALE_ORDER_PRODUCT_STAGES.INVOICED,
            [Op.or]: [
                {
                    '$packagingList.salesOrderInvoice.createdAt$': {
                        [Op.gte]: startDate
                    }
                },
                {
                    '$packagingList.salesOrderInvoice.id$': null,
                    updatedAt: {
                        [Op.gte]: startDate
                    }
                }
            ]
        },
        include: [
            {
                model: models.InventoryProduct,
                as: "inventoryProduct",
                include: [
                    {
                        model: models.Slab,
                        as: "slab",
                        attributes: ["id", "receivingLength", "receivingWidth", "receivedSqrFt"]
                    }
                ]
            },
            {
                model: models.PackagingList,
                as: "packagingList",
                required: false,
                include: [
                    {
                        model: models.SalesOrderInvoice,
                        as: "salesOrderInvoice",
                        required: false,
                        attributes: ["id", "createdAt"]
                    }
                ]
            }
        ]
    });

    // 2. Generate list of current and last 10 months (11 months in total)
    const months: { year: number; month: number; label: string; profit: number }[] = [];
    for (let i = 10; i >= 0; i--) {
        const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const label = d.toLocaleString('en-US', { month: 'short' });
        months.push({
            year: d.getFullYear(),
            month: d.getMonth(),
            label: `${label} ${d.getFullYear().toString().slice(-2)}`, // e.g. "Jan 26"
            profit: 0
        });
    }

    // Helper to match a date to our months list
    const getMonthIndex = (date: Date) => {
        const y = date.getFullYear();
        const m = date.getMonth();
        return months.findIndex(item => item.year === y && item.month === m);
    };

    // 3. Loop over all invoiced salesOrderProducts and compute profit
    for (const sop of salesOrderProducts) {
        const amount = Number(sop.get("amount")) || 0;
        let landedCost = 0;

        const inventoryProduct = (sop as any).inventoryProduct;
        if (inventoryProduct) {
            landedCost = Number(inventoryProduct.assetValue) || 0;
        }

        const profit = decimals.decimalSubtract(amount, landedCost);

        // Determine date of invoicing: use salesOrderInvoice.createdAt, fall back to packagingList.plDate or sop.updatedAt
        let invoiceDate = sop.updatedAt;
        const packagingList = (sop as any).packagingList;
        if (packagingList) {
            const salesOrderInvoice = (packagingList as any).salesOrderInvoice;
            if (salesOrderInvoice && salesOrderInvoice.createdAt) {
                invoiceDate = salesOrderInvoice.createdAt;
            } else if (packagingList.plDate) {
                invoiceDate = new Date(packagingList.plDate);
            }
        }

        if (invoiceDate) {
            const idx = getMonthIndex(new Date(invoiceDate));
            if (idx !== -1) {
                months[idx].profit = decimals.decimalAdd(months[idx].profit, profit);
            }
        }
    }

    // 4. Calculate stats for the current month and percentage change compared to the previous month
    const currentMonthData = months[10];
    const previousMonthData = months[9];

    const currentMonthProfit = currentMonthData.profit;
    const previousMonthProfit = previousMonthData.profit;

    let percentageChange = 0;
    if (previousMonthProfit > 0) {
        percentageChange = Number((((currentMonthProfit - previousMonthProfit) / previousMonthProfit) * 100).toFixed(1));
    } else if (currentMonthProfit > 0) {
        percentageChange = 100.0;
    }

    return {
        chartData: months.map(m => ({
            name: m.label,
            profit: m.profit
        })),
        currentMonthProfit,
        percentageChange
    };
};
