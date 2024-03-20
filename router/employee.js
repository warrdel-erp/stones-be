// const router = require("express").Router()
// const Employee = require("../models/employee_models")


// router.post("/", async (req, res) => {
//     try {
//         var employee = req.body
//         employee["employeeid"] = Date.now().toString()
//         const newemployee = await new Employee(employee).save().then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(newemployee)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.get("/", async (req, res) => {
//     try {
//         const allemployee = await Employee.find({}).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allemployee)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.get("/:employeeid", async (req, res) => {
//     const { employeeid } = req.params
//     try {
//         const allemployee = await Employee.find({ "employeeid": employeeid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allemployee)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.post("/update/:employeeid", async (req, res) => {
//     const { employeeid } = req.params
//     try {
//         const allemployee = await Employee.updateMany({ "employeeid": employeeid }, { $set: req.body }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(allemployee)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// router.delete("/:employeeid", async (req, res) => {
//     const { employeeid } = req.params
//     try {
//         const employeeidremove = await Employee.remove({ "employeeid": employeeid }).then((res) => { return res }).catch((err) => { throw err.message })
//         return res.send(employeeidremove)
//     } catch (error) {
//         return res.status(500).send(error)
//     }
// })

// module.exports = router