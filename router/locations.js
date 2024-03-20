// const router = require("express").Router()
// const Locations = require("../models/locations_models")


// router.post("/", async (req, res) => {
//     try {
//         var locations = req.body
//         locations["locationsid"] = Date.now().toString()
//         const newlocations = await new Locations(locations).save().then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(newlocations)
//     } catch (error) {
//         return res.send(error)
//     }
// })

// router.get("/", async (req, res) => {
//     try {
//         const alllocations = await Locations.find({}).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(alllocations)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.get("/:locationsid", async (req, res) => {
//     const { locationsid } = req.params
//     try {
//         const alllocations = await Locations.find({ "locationsid": locationsid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(alllocations)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.post("/update/:locationsid", async (req, res) => {
//     const { locationsid } = req.params
//     try {
// 		 const updatelocations = await Locations.updateMany({ "locationsid": locationsid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(updatelocations)
//     } catch (error) {
//         console.log(error)
//         return res.status(500).send(error)
//     }
// })

// router.delete("/:locationsid", async (req, res) => {
//     const { locationsid } = req.params
//     try {
// 		  const locationsremove = await Locations.remove({ "locationsid": locationsid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(locationsremove)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// module.exports = router