// const router = require("express").Router()
// const Vendors = require("../models/vendor_models")


// router.post("/", async (req, res) => {
//     try {
//         var vendor = req.body
//         vendor["vendorsid"] = Date.now().toString()
//         const newvendor = await new Vendors(vendor).save().then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(newvendor)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.get("/", async (req, res) => {
//     try {
//         const allvendor = await Vendors.find({}).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allvendor)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.get("/:vendorsid", async (req, res) => {
//     const { vendorsid } = req.params
//     try {
//         const allvendor = await Vendors.find({ "vendorsid": vendorsid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allvendor)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.post("/update/:vendorsid", async (req, res) => {
//     const { vendorsid } = req.params
//     try {
//         const allvendor = await Vendors.updateMany({ "vendorsid": vendorsid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allvendor)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.delete("/:vendorsid", async (req, res) => {
//     const { vendorsid } = req.params
//     try {
//         const vendorsidremove = await Vendors.remove({ "vendorsid": vendorsid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(vendorsidremove)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// module.exports = router