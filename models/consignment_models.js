const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const consignmentSechma = new Sechma({
    name: {
        type: String,
        default: null
    },
    consignmentid: {
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
    }
})

const consignment = mongoose.model("consignment", consignmentSechma)
module.exports = consignment