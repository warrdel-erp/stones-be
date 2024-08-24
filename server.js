import express, { json, urlencoded } from 'express'
import cors from 'cors'
const app = express()
const PORT = process.env.PORT || 8080

import addProductRouter from './router/productRoutes.js';
import userRouter from './router/adminauth/userRouter.js'
import supplier from './router/supplierRoutes.js'
import setting from './router/settingsRoutes.js'
import customer from './router/customerRoutes.js'
import purchaseOrder from './router/purchaseOrderRoutes.js'
import salesOrder from './router/salesOrderRoutes.js'
import accounts from './router/accountsRoutes.js'
import dashboard from './router/dashboardRoutes.js'
// import roles from './router/roleAssignRoutes.js';
import role from './router/roleAssignRoutes.js'
import client from './router/adminauth/clientRoutes.js'
// middleware
app.use(json())
app.use(cors())
app.use(urlencoded({ extended: true }))

//routes
app.use("/product", addProductRouter);
app.use("/user", userRouter)
app.use("/supplier", supplier)
app.use("/setting", setting)
app.use("/customer", customer);
app.use('/purchaseOrder', purchaseOrder);
app.use("/salesOrder",salesOrder);
app.use("/accounts", accounts);
app.use("/dashboard", dashboard);
app.use("/roles", role);
app.use('/client',client)


app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})