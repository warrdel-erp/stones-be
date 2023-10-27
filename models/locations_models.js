const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const locationsSechma = new Sechma({
    shortname: {
        type: String,
        default: null
    },
    logo: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    locationsid: {
        type: String,
        default: null
    },
    type: {
        type: String,
        default: null
    },
    tax: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    state: {
        type: String,
        default: null
    },
    zipcode: {
        type: String,
        default: null
    },
    primary_phone: {
        type: String,
        default: null
    },
    fax: {
        type: String,
        default: null
    },
    pricelevel: {
        type: String,
        default: null
    },
    payment_term: {
        type: String,
        default: null
    },
    email: {
        type: String
    },
    website: {
        type: String
    },
    unit: {
        type: String
    },
    country: {
        type: String
    }
})

const locations = mongoose.model("locations", locationsSechma)
module.exports = locations