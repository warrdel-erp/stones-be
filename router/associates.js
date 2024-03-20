// const router = require("express").Router();
// const Associates = require("../models/associates_models");

// router.post("/", async (req, res) => {
//   try {
//     var associate = req.body;
//     associate["associatesid"] = Date.now().toString();
//     const newassociate = await new Associates(associate)
//       .save()
//       .then((res) => {
//         return res;
//       })
//       .catch((err) => {
//         throw err.message;
//       });
//     return res.send(newassociate);
//   } catch (error) {
//     return res.status(500).send(error);
//   }
// });

// router.get("/", async (req, res) => {
//   try {
//     const allassociate = await Associates.find({})
//       .then((res) => {
//         return res;
//       })
//       .catch((err) => {
//         throw err.message;
//       });
//     return res.send(allassociate);
//   } catch (error) {
//     return res.status(500).send(error);
//   }
// });

// router.get("/:associatesid", async (req, res) => {
//   const { associatesid } = req.params;
//   try {
//     const allassociate = await Associates.find({ associatesid: associatesid })
//       .then((res) => {
//         return res;
//       })
//       .catch((err) => {
//         throw err.message;
//       });
//     return res.send(allassociate);
//   } catch (error) {
//     return res.status(500).send(error);
//   }
// });

// router.post("/update/:associatesid", async (req, res) => {
//   const { associatesid } = req.params;
//   try {
//     const allassociate = await Associates.updateMany(
//       { associatesid: associatesid },
//       { $set: req.body }
//     )
//       .then((res) => {
//         return res;
//       })
//       .catch((err) => {
//         throw err.message;
//       });
//     return res.send(allassociate);
//   } catch (error) {
//     return res.status(500).send(error);
//   }
// });

// router.delete("/:associatesid", async (req, res) => {
//   const { associatesid } = req.params;
//   try {
//     const associatesidremove = await Associates.remove({
//       associatesid: associatesid,
//     })
//       .then((res) => {
//         return res;
//       })
//       .catch((err) => {
//         throw err.message;
//       });
//     return res.send(associatesidremove);
//   } catch (error) {
//     return res.status(500).send(error);
//   }
// });

// module.exports = router;
