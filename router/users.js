// const router = require("express").Router()
// const Users = require("../models/users_models")


// router.post("/", async (req, res) => {
//     try {
//         var users = req.body
//         users["userid"] = Date.now().toString()
//         const newusers = await new Users(users).save().then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(newusers)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.get("/", async (req, res) => {
//     try {
//         const allusers = await Users.find({}).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allusers)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })


// router.get("/:userid", async (req, res) => {
//     const { userid } = req.params
//     try {
//         const allusers = await Users.find({ "userid": userid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allusers)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.post("/update/:associatesid", async (req, res) => {
//     const { userid } = req.params
//     try {
//         const allusers = await Users.updateMany({ "userid": userid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allusers)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.delete("/:associatesid", async (req, res) => {
//     const { userid } = req.params
//     try {
//         const userremove = await Users.remove({ "userid": userid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(userremove)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// module.exports = router