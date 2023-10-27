const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const userSechma = new Sechma({
    username: {
        type: String,
        default: null
    },
    userid: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
})

const employee = mongoose.model("user", userSechma)
module.exports = employee