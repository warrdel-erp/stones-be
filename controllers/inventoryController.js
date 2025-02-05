import * as inventoryService from '../services/inventory.service.js'

// 2. get all product name
export const inventoryBalance = async (req, res) => {

    try {
        const productId = req.query.productId
        const result = await inventoryService.inventoryBalance(productId);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting products name:", error);
        res.status(500).send("Internal Server Error");
    }
};
