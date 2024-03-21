import express, { json, urlencoded } from 'express'
import cors from 'cors'
const app = express()
const PORT = process.env.PORT || 8080

import addProductRouter from './router/productRoutes.js';
import userRouter from './router/adminauth/userRouter.js'
// import login from './router/adminauth/loginRouters.js'

// middleware
app.use(json())
app.use(cors())
app.use(urlencoded({ extended: true }))

//routes
app.use("/product", addProductRouter);
app.use("/user", userRouter)
// app.use("/login", login)

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})