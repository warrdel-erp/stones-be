const router = require("express").Router()
const Resourse = require("../models/resourse_models")


router.post("/", async (req, res) => {
    try {
        var resourse = req.body
        resourse["resourseid"] = Date.now().toString()
        const newresourse = await new Resourse(resourse).save().then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(newresourse)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get("/", async (req, res) => {
    try {
        const allresourse = await Resourse.find({}).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allresourse)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.get("/:resourseid", async (req, res) => {
    const { resourseid } = req.params
    try {
        const allresourse = await Resourse.find({ "resourseid": resourseid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allresourse)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.post("/update/:resourseid", async (req, res) => {
    const { resourseid } = req.params
    try {
        const allresourse = await Resourse.updateMany({ "resourseid": resourseid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(allresourse)
    } catch (error) {
        return res.status(500).send(error)
    }
})

router.delete("/:resourseid", async (req, res) => {
    const { resourseid } = req.params
    try {
        const resourseidremove = await Resourse.remove({ "resourseid": resourseid }).then((res) => { return res }).catch((err) => { throw err.message })
        return res.send(resourseidremove)
    } catch (error) {
        return res.status(500).send(error)
    }
})

module.exports = router