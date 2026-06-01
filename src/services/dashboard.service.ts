import * as inventoryProductRepository from "../repositories/inventoryProduct.repository";
import * as salesOrderProductRepository from "../repositories/salesOrderProduct.repository";
import * as decimals from "../helper/decimal";

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
            const landedUnitCost = Number(inventoryProduct.landedUnitCost) || 0;
            const isSlab = (sop as any).isSlabType || (inventoryProduct as any).isSlabType || false;

            if (isSlab) {
                const slab = (inventoryProduct as any).slab;
                if (slab) {
                    const area = Number(slab.receivedSqrFt);
                    landedCost = decimals.decimalMultiply(landedUnitCost, area);
                }
            } else {
                landedCost = landedUnitCost;
            }
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
