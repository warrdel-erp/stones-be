const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const prepurchaserequestSechma = new Sechma({
    prepurchaserequestid: {
        type: String,
        default: null
    },
    purchasedate: {
        type: String,
        default: null
    },
    shipdate: {
        type: String,
        default: null
    },
    etadate: {
        type: String,
    },
    shipmentterm: {
        type: String,
        default: null
    },
    deliverytype: {
        type: String,
        default: null
    },
    requestedby: {
        type: String,
        default: null
    },
    supplier: {
        type: String,
        default: null
    },
    supplier_address: {
        type: String,
        default: null
    },
    supplier_unit: {
        type: String,
        default: null
    },
    supplier_state: {
        type: String,
        default: null
    },
    supplier_zipcode: {
        type: String,
        default: null
    },
    supplier_country: {
        type: String,
        default: null
    },
    purchase_address: {
        type: String,
        default: null
    },
    purchase_unit: {
        type: String,
        default: null
    },
    purchase_state: {
        type: String,
        default: null
    },
    purchase_zipcode: {
        type: String,
        default: null
    },
    purchase_country: {
        type: String,
        default: null
    },
    shipping_address: {
        type: String,
        default: null
    },
    shipping_unit: {
        type: String,
        default: null
    },
    shipping_state: {
        type: String,
        default: null
    },
    shipping_zipcode: {
        type: String,
        default: null
    },
    shipping_country: {
        type: String,
        default: null
    },
    paymentterm: {
        type: String,
        default: null
    },
    printednotes: {
        type: String,
        default: null
    },
    internalnotes: {
        type: String,
        default: null
    },
    specialnotes: {
        type: String,
        default: null
    },
    prepurchaseterm: {
        type: String,
        default: null
    },
})

const prepurchaserequest = mongoose.model("prepurchaserequest", prepurchaserequestSechma)
module.exports = prepurchaserequest