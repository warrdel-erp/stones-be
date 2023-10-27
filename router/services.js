const router = require("express").Router()
const Services = require("../models/services_models")


router.post("/", async (req, res) => {
    try {
        var services = req.body
        services["servicesid"] = Date.now().toString()
        const newservices = await new Services(services).save().then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(newservices)
    } catch (error) {
        return res.send(error)
    }
})
router.get("/", async (req, res) => {
    try {
        const allservices = await Services.find({}).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allservices)
    } catch (error) {
		console.log(error)
        return res.status(500).send(error)
    }
})
router.get("/:servicesid", async (req, res) => {
    const { servicesid } = req.params
    try {
        const allservices = await Services.find({ "servicesid": servicesid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allservices)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post("/update/:servicesid", async (req, res) => {
    const { servicesid } = req.params
    try {
        const updateservices = await Services.updateMany({ "servicesid": servicesid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(updateservices)
    } catch (error) {
        console.log(error)
        return res.status(500).send(error)
    }
})

router.delete("/:servicesid", async (req, res) => {
    const { servicesid } = req.params
    try {
        const servicesremove = await Services.remove({ "servicesid": servicesid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(servicesremove)
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router
