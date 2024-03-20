// const router = require("express").Router()
// const Suppliers = require("../models/supplier_models")


// router.post("/", async (req, res) => {
//     try {
//         var supplier = req.body
//         supplier["suppliersid"] = Date.now().toString()
//         const newsupplier = await new Suppliers(supplier).save().then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(newsupplier)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.get("/", async (req, res) => {
//     try {
//         const allsupplier = await Suppliers.find({}).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allsupplier)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.get("/:suppliersid", async (req, res) => {
//     const { suppliersid } = req.params
//     try {
//         const allsupplier = await Suppliers.find({ "suppliersid": suppliersid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allsupplier)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.post("/update/:suppliersid", async (req, res) => {
//     const { suppliersid } = req.params
//     try {
//         const allsupplier = await Suppliers.updateMany({ "suppliersid": suppliersid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allsupplier)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.delete("/:suppliersid", async (req, res) => {
//     const { suppliersid } = req.params
//     try {
//         const suppliersidremove = await Suppliers.remove({ "suppliersid": suppliersid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(suppliersidremove)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// module.exports = router