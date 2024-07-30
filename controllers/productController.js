import * as productService from '../services/productServices.js'

// 1. create product
export const addProduct = async (req,res) => {
    try {
        const user = req.user
        const createdBy = user.dataValues.id
        const info = req.body
        const result = await productService.addProducts({...info,createdBy});
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in addProduct:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 2. get all product name
export const getAllProducts = async (req,res) => {
    let {search} = req.query
     search = search || 'all' 
    try {
        const result = await productService.getAllProducts(search);
        res.status(200).send(result);
    } catch (error) {
        console.error("Error in getting products name:", error);
        res.status(500).send("Internal Server Error");
    }
};

// 3. get single product details
export const getSingleProductDetails = async (req,res) => {
    const productName = req.query.productName;
    try {
        if (!productName){
            res.status(400).send("productName is required");
        }
        const result = await productService.getSingleProductDetails(productName);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in getting ${productName} details:`, error);
        res.status(500).send("Internal Server Error");
    }
};

// 4. update product 
export const updateProduct = async (req,res) => {
    const productName = req.body.productName || req.query.productName || req.headers["x-productName"];
    const info = req.body;
    
    try {
        if (!productName){
            res.status(400).send("productName is required");
        }
        const result = await productService.updateProduct(productName, info);
        res.status(200).send(result);
    } catch (error) {
        console.error(`Error in updating ${productName}:`, error);
        res.status(500).send("Internal Server Error");
    }
};
