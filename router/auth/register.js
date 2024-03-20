// const router = require("express").Router()
// const Users = require("../../models/users_models")
// const { v4: uuidv4 } = require('uuid');
// const bcrypt = require('bcryptjs');


// router.post("/", async (req, res) => {

//     // Our register logic starts here
//   try {
//     // Get user input
//     const { username, phone, email, password } = req.body;

//     // Validate user input
//     if (!(email && password && username && phone)) {
//       res.status(400).send("All input is required");
//     }

//     // check if user already exist
//     // Validate if user exist in our database
//     const oldUser = await Users.findOne({ email });

//     if (oldUser) {
//       return res.status(409).send("User Already Exist. Please Login");
//     }

//     //Encrypt user password
//     encryptedPassword = await bcrypt.hash(password, 10);

//     // Create user in our database
//     const user = await Users.create({
//       phone,
//       userid: uuidv4(),
//       username,
//       email: email.toLowerCase(), // sanitize: convert email to lowercase
//       password: encryptedPassword,
//     });

//     // return new user
//     res.status(201).json(user);
//   } catch (err) {
//     console.log(err);
//   }
//   // Our register logic ends here
// })


// module.exports = router