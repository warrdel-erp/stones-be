import express, { json, urlencoded } from 'express'
import cors from 'cors'
const app = express()
const PORT = process.env.PORT || 8080
import addProductRouter from './router/addProductRoutes.js';

// middleware
app.use(json())
app.use(cors())
app.use(urlencoded({ extended: true }))

//routes
app.use("/addproduct", addProductRouter);

app.listen(PORT, () => {
    console.log(`server is running on backend port ${PORT}`)
})