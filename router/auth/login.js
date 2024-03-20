// const router = require("express").Router()
// const Users = require("../../models/users_models")
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');


// router.post("/", async (req, res) => {

//     // Our login logic starts here
//     try {
//       // Get user input
//       const { email, password } = req.body;
  
//       // Validate user input
//       if (!(email && password)) {
//         res.status(400).send("All input is required");
//       }
//       // Validate if user exist in our database
//       const user = await Users.findOne({ email }).lean();
  
//       if (user && (await bcrypt.compare(password, user.password))) {
//         // Create token
//         const token = jwt.sign(
//           { user_id: user._id, email },
//           process.env.TOKEN_KEY,
//         );
  
//         const data = {};
//         res.status(200).json(Object.assign(data, {...user, token}));
//       }else{
//         res.status(400).send("Invalid Credentials");
//       }
//     } catch (err) {
//       console.log(err);
//     }
//     // Our register logic ends here
//   });
//   module.exports = router