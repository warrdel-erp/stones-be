// const router = require("express").Router()
// const PrepurchaseRequest = require("../models/prepurchaserequest")


// router.post("/", async (req, res) => {
//     try {
//         var prepurchasereques = req.body
//         prepurchasereques["prepurchaserequestid"] = Date.now().toString()
//         const newprepurchaserequestid = await new PrepurchaseRequest(prepurchasereques).save().then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(newprepurchaserequestid)
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send(error)
//     }
// })

// router.get("/", async (req, res) => {
//     try {
//         const allprepurchaserequest = await PrepurchaseRequest.find({}).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allprepurchaserequest)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.get("/:prepurchaserequestid", async (req, res) => {
//     const { prepurchaserequestid } = req.params
//     try {
//         const allprepurchaserequest = await PrepurchaseRequest.find({ "prepurchaserequestid": prepurchaserequestid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allprepurchaserequest)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.post("/update/:prepurchaserequestid", async (req, res) => {
//     const { prepurchaserequestid } = req.params
//     try {
//         const allprepurchaserequest = await PrepurchaseRequest.updateMany({ "prepurchaserequestid": prepurchaserequestid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allprepurchaserequest)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.delete("/:prepurchaserequestid", async (req, res) => {
//     const { prepurchaserequestid } = req.params
//     try {
//         const prepurchaserequestidremove = await PrepurchaseRequest.remove({ "prepurchaserequestid": prepurchaserequestid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(prepurchaserequestidremove)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// module.exports = router