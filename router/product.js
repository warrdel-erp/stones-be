const router = require("express").Router()
const Product = require("../models/product_models")


router.post("/", async (req, res) => {
    try {
        var product = req.body
        product["productid"] = Date.now().toString()
        const newproduct = await new Product(product).save().then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(newproduct)
    } catch (error) {
        return res.send(error)
    }
})

router.get("/", async (req, res) => {
    try {
        const allproduct = await Product.find({}).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allproduct)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get("/:productid", async (req, res) => {
    const { productid } = req.params
    try {
        const allproduct = await Product.find({ "productid": productid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allproduct)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post("/update/:productid", async (req, res) => {
    const { productid } = req.params
    try {
        const updateproduct = await Product.updateMany({ "productid": productid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(updateproduct)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.delete("/:productid", async (req, res) => {
    const { productid } = req.params
    try {
        const productremove = await Product.remove({ "productid": productid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(productremove)
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router