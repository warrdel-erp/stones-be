const mongoose = require("mongoose")
const Sechma = mongoose.Schema

const userSechma = new Sechma({
    username: {
        type: String,
        default: null,
        required: [true, 'User Name is required.'],
    },
    userid: {
        type: String,
        default: null,
    },
    password: {
        type: String,
        default: null,
        required: [true, 'Password is required.'],
    },
    phone: {
        type: String,
        default: null,
        required: [true, 'Phone No is required.'],
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Email is required.'],
    },
})

const employee = mongoose.model("user", userSechma)
module.exports = employee