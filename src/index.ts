import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import { connectDB } from "./config/database";
import catchAsync from "./helper/asyncCatch";
import { SuccessResponse } from "./helper/response";
import { errorHandler } from "./middleware/errorHandler";
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
import { syncModels } from "./config/syncModels";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.get(
  "/test",
  catchAsync(async (req, res) => {
    SuccessResponse(res, 200, "Client created successfully", []);
  })
);

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

// handler error globally.
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    syncModels();
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
