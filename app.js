const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv").config()
const cors = require("cors")
const path = require("path")
const port = 9090 || process.env.PORT
var app = express()

app.set("view engine", "ejs")

const mongoDB = require("./database/mongodb")

//Body Parser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(morgan("dev"))

app.use("/download", express.static(path.join(__dirname + "/download")))
//cors config
app.use(cors())

//Router
app.use("/associates", require("./router/associates"))
app.use("/product", require("./router/product"))
app.use("/customer", require("./router/customers"))
app.use("/locations", require("./router/locations"))
app.use("/product", require("./router/product"))
app.use("/services", require("./router/services"))
app.use("/suppliers", require("./router/supplier"))
app.use("/vendors", require("./router/vendor"))
app.use("/employee", require("./router/employee"))
app.use("/resourse", require("./router/resourse"))
app.use("/consignment", require("./router/consignment"))
app.use("/inventorysuppliers", require("./router/inventorysuppliers"))
app.use("/prepurchaserequest", require("./router/prepurchaserequest"))
app.use("/purchaseorder", require("./router/purchaseorder"))
app.use("/users", require("./router/users"))
app.use("/register", require("./router/auth/register"))
app.use("/login", require("./router/auth/login"))

//server init
app.listen(port, () => { console.log(`Api Running on http://localhost:${port}`) })