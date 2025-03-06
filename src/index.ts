import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { urlencoded } from "express";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { syncModels } from "./config/syncModels";

// Routes
import clientRoute from "./routes/client.routes";
import userRoute from "./routes/user.routes";
import vendorRoute from "./routes/vendor.routes";
import purchaseOrderRoute from "./routes/purchaseOrder.routes";
import productRoute from "./routes/product.routes";
import billRoute from "./routes/bill.routes";
import siplRoute from "./routes/sipl.routes";
import generalRoute from "./routes/general.routes";
import binRoute from "./routes/bin.routes";
import inventoryRoute from "./routes/inventory.routes";
import slabRoute from "./routes/slab.routes";
import coaRoute from "./routes/coa.routes";
import customerRoute from "./routes/customer.routes";
import salesOrderRoute from "./routes/salesOrder.routes";
import loadingOrderRoute from "./routes/loadingOrder.routes";
import packagingListRoute from "./routes/packagingList.routes";
import requestedPurchaseProductRoute from "./routes/requestedPurchaseProduct.routes";
import siplProductRoute from "./routes/siplProduct.routes";
import paymentRoutes from "./routes/payment.routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));

// Routes
app.use("/api/client", clientRoute);
app.use("/api/user", userRoute);
app.use("/api/vendor", vendorRoute);
app.use("/api/purchaseOrder", purchaseOrderRoute);
app.use("/api/product", productRoute);
app.use("/api/bill", billRoute);
app.use("/api/sipl", siplRoute);
app.use("/api/general", generalRoute);
app.use("/api/bin", binRoute);
app.use("/api/inventory", inventoryRoute);
app.use("/api/slab", slabRoute);
app.use("/api/coa", coaRoute);
app.use("/api/customer", customerRoute);
app.use("/api/salesOrder", salesOrderRoute);
app.use("/api/loadingOrder", loadingOrderRoute);
app.use("/api/packagingList", packagingListRoute);
app.use("/api/requestedPurchaseProduct", requestedPurchaseProductRoute);
app.use("/api/siplProduct", siplProductRoute);
app.use("/api/payment", paymentRoutes);

// handler error globally.
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    syncModels();
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
