const router = require("express").Router()
const Customers = require("../models/customers_models")


router.post("/", async (req, res) => {
    try {
        var customer = req.body
        customer["customerid"] = Date.now().toString()
        const newcustomer = await new Customers(customer).save().then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(newcustomer)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get("/", async (req, res) => {
    try {
        const allcustomer = await Customers.find({}).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allcustomer)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get("/:customerid", async (req, res) => {
    const { customerid } = req.params
    try {
        const allcustomer = await Customers.find({ "customerid": customerid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allcustomer)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post("/update/:customerid", async (req, res) => {
    const { customerid } = req.params
    try {
        const allcustomer = await Customers.updateMany({ "customerid": customerid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allcustomer)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.delete("/:customerid", async (req, res) => {
    const { customerid } = req.params
    try {
        const customerremove = await Customers.remove({ "customerid": customerid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(customerremove)
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router