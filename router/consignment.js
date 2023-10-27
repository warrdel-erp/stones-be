const router = require("express").Router()
const Consignment = require("../models/consignment_models")


router.post("/", async (req, res) => {
    try {
        var consignment = req.body
        consignment["consignmentid"] = Date.now().toString()
        const newconsignment = await new Consignment(consignment).save().then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(newconsignment)
    } catch (error) {
		console.log(error)
        return res.send(error)
    }
})

router.get("/", async (req, res) => {
    try {
        const allconsignment = await Consignment.find({}).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allconsignment)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get("/:consignmentid", async (req, res) => {
    const { consignmentid } = req.params
    try {
        const allconsignment = await Consignment.find({ "consignmentid": consignmentid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allconsignment)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post("/update/:consignmentid", async (req, res) => {
    const { consignmentid } = req.params
    try {
		 const updateconsignment = await Consignment.updateMany({ "consignmentid": consignmentid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(updateconsignment)
    } catch (error) {
        console.log(error)
        return res.status(500).send(error)
    }
})

router.delete("/:consignmentid", async (req, res) => {
    const { consignmentid } = req.params
    try {
		  const consignmentremove = await Consignment.remove({ "consignmentid": consignmentid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(consignmentremove)
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router