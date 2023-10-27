const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const suppliersSechma = new Sechma({
    name: {
        type: String,
        default: null
    },
    suppliersid: {
        type: String,
        default: null
    },
    conatct_name: {
        type: String,
        default: null
    },
    referby: {
        type: String,
        default: null
    },
    type: {
        type: String,
    },
    primary_phone: {
        type: String,
        default: null
    },
    secondary_phone: {
        type: String,
        default: null
    },
    mobile: {
        type: String,
        default: null
    },
    fax: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    account_email: {
        type: String,
        default: null
    },
    website: {
        type: String,
        default: null
    },
    bill_address: {
        type: String,
        default: null
    },
    bill_city: {
        type: String,
        default: null
    },
    bill_state: {
        type: String,
        default: null
    },
    bill_zipcode: {
        type: String,
        default: null
    },
    bill_country: {
        type: String,
        default: null
    },
    bill_unit: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    primary_salesperson: {
        type: String,
        default: null
    },
    internal_notes: {
        type: String,
        default: null
    },
    default_payment: {
        type: String,
        default: null
    },
    frieght: {
        type: String,
        default: null
    },
    credit_limit: {
        type: String,
        default: null
    },
    ein_number: {
        type: String,
        default: null
    },
    account: {
        type: String,
        default: null
    },
    currency: {
        type: String,
        default: null
    },
    payment_term: {
        type: String,
        default: null
    },
    shipment_term: {
        type: String,
        default: null
    },
    Purchase: {
        type: String,
        default: null
    }
})

const suppliers = mongoose.model("suppliers", suppliersSechma)
module.exports = suppliers