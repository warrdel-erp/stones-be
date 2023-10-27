const router = require("express").Router()
const Purchaseorder = require("../models/purchaseorder")


router.post("/", async (req, res) => {
    try {
        var purchaseorder = req.body
        purchaseorder["purchaseorderid"] = Date.now().toString()
        const newpurchaseorder = await new Purchaseorder(purchaseorder).save().then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(newpurchaseorder)
    } catch (error) {
        return res.send(error)
    }
})

router.get("/", async (req, res) => {
    try {
        const allpurchaseorder = await Purchaseorder.find({}).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allpurchaseorder)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get("/:purchaseorderid", async (req, res) => {
    const { purchaseorderid } = req.params
    try {
        const allpurchaseorder = await Purchaseorder.find({ "purchaseorderid": purchaseorderid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allpurchaseorder)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post("/update/:purchaseorderid", async (req, res) => {
    const { purchaseorderid } = req.params
    try {
        const updatepurchaseorder = await Purchaseorder.updateMany({ "purchaseorderid": purchaseorderid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(updatepurchaseorder)
    } catch (error) {
        console.log(error)
        return res.status(500).send(error)
    }
})

router.delete("/:purchaseorderid", async (req, res) => {
    const { purchaseorderid } = req.params
    try {
        const purchaseorderremove = await Purchaseorder.remove({ "purchaseorderid": purchaseorderid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(purchaseorderremove)
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router