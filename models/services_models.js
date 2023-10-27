const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const servicesSechma = new Sechma({
    picture: {
        type: String,
        required: true
    },
    servicesid: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    price1: {
        type: String,
    },
    units: {
		 type: String,
    },
    pricerange: {
        type: String,
        required: true
    },
    prefvendor: {
        type: String,
		  required: true
    },
    status: {
        type: String,
        required: true
    },
    usage: {
        type: String,
        required: true
    },
})

const services = mongoose.model("services", servicesSechma)
module.exports = services