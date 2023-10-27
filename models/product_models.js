const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const productSechma = new Sechma({
    altname: {
        type: String,
    },
    productid: {
        type: String,
    },
    product_img: {
        type: String,
    },
    pname: {
        type: String,
    },
    sku: {
        type: String,
    },
    kind: {
        type: String,
    },
    type: {
        type: String,
    },
    category: {
        type: String,
    },
    subcategory: {
        type: String,
    },
    group: {
        type: String,
    },
    orgin: {
        type: String,
    },
    pricerange: {
        type: String,
    },
    supplier: {
        type: String,
    },
    serialname: {
        type: String,
    },
    color: {
        type: String,
    },
    uom: {
        type: String,
    },
    finish: {
        type: String,
    },
    weight: {
        type: String,
    },
    thinckness: {
        type: String,
    },
    singleslap: {
        type: String,
    },
    bundle: {
        type: String,
    },
    select: {
        type: String,
    },
    standard: {
        type: String,
    },
    defaultpricerange: {
        type: String,
    },
    glincome: {
        type: String,
    },
    glcost: {
        type: String,
    },
    safetystock: {
        type: String,
    },
    recorderqty: {
        type: String,
    },
    leadtime: {
        type: String,
    },
    bin_frame: {
        type: String,
    },
    supplierproduct: {
        type: String,
    },
    brand: {
        type: String,
    },
    suppliersku: {
        type: String,
    },
    purchaseunit: {
        type: String,
    },
    qty: {
        type: String,
    },
    avgcost: {
        type: String,
    },
    notes: {
        type: String,
    },
    instruction: {
        type: String,
    },
    disclimer: {
        type: String,
    },
    avgcost: {
        type: String,
    },
})

const products = mongoose.model("product", productSechma)
module.exports = products