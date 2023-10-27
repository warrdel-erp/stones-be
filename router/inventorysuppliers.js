const router = require("express").Router()
const InventorySupplier = require("../models/InventorySupplier")


router.post("/", async (req, res) => {
    try {
        var InventorySupplierid = req.body
        InventorySupplierid["inventorySupplierid"] = Date.now().toString()
        const newInventorySupplierid = await new InventorySupplier(InventorySupplierid).save().then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(newInventorySupplierid)
    } catch (error) {
        console.log(error);
        return res.status(500).send(error)
    }
})

router.get("/", async (req, res) => {
    try {
        const allInventorySupplierid = await InventorySupplier.find({}).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allInventorySupplierid)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get("/:inventorySupplierid", async (req, res) => {
    const { inventorySupplierid } = req.params
    try {
        const allInventorySupplierid = await InventorySupplier.find({ "inventorySupplierid": inventorySupplierid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allInventorySupplierid)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post("/update/:inventorySupplierid", async (req, res) => {
    const { inventorySupplierid } = req.params
    try {
        const allInventorySupplierid = await InventorySupplier.updateMany({ "inventorySupplierid": inventorySupplierid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allInventorySupplierid)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.delete("/:inventorySupplierid", async (req, res) => {
    const { inventorySupplierid } = req.params
    try {
        const inventorySupplieridremove = await InventorySupplier.remove({ "inventorySupplierid": inventorySupplierid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(inventorySupplieridremove)
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router