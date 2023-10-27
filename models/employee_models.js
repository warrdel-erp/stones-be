const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const employeeSechma = new Sechma({
    name: {
        type: String,
        default: null
    },
    employeeid: {
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
    usergroup: {
        type: String,
        default: null
    },
    username: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    cpassword: {
        type: String,
        default: null
    },
    hpassword: {
        type: String,
        default: null
    },
})

const employee = mongoose.model("employee", employeeSechma)
module.exports = employee