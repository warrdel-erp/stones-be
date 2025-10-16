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
import ledgerAccountRoutes from "./routes/ledgerAccount.routes";
import notesRoutes from "./routes/note.routes";
import containerRoutes from "./routes/container.routes";
import masterRoutes from "./routes/master.routes";
import salesOrderProductRoutes from "./routes/salesOrderProduct.routes";
import journalEntryRoutes from "./routes/journalEntry.routes";
import truckRoutes from "./routes/truck.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import productSubCategoryRoutes from "./routes/productSubCategory.routes";
import productGroupRoutes from "./routes/productGroup.routes";
import productBaseColorRoutes from "./routes/productBaseColor.routes";
import productFinishRoutes from "./routes/productFinish.routes";
import soInvoiceRoutes from "./routes/soInvoice.routes";
import authRoutes from "./routes/auth.routes";
import accountRoutes from "./routes/account.routes";
import advancedDepositRoutes from "./routes/advancedDeposit.routes";
import returnRoutes from "./routes/return.routes";
import deliveryRoutes from "./routes/delivery.routes";
import serviceRoutes from "./routes/service.routes";
import serviceCategoryRoutes from "./routes/serviceCategory.routes";
import tradeServiceRoutes from "./routes/tradeService.routes";
import genericProductRoutes from "./routes/genericProduct.routes";
import inventoryProductRoutes from "./routes/inventoryProduct.routes";
import creditDebitNoteRoutes from "./routes/creditDebitNote.routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
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
app.use("/api/ledgerAccount", ledgerAccountRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/container", containerRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/salesOrderProduct", salesOrderProductRoutes);
app.use("/api/journalEntry", journalEntryRoutes);
app.use("/api/truck", truckRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/productSubCategory", productSubCategoryRoutes);
app.use("/api/productGroup", productGroupRoutes);
app.use("/api/productBaseColor", productBaseColorRoutes);
app.use("/api/productFinish", productFinishRoutes);
app.use("/api/soInvoice", soInvoiceRoutes);
app.use("/api/advancedDeposit", advancedDepositRoutes);
app.use("/api/return", returnRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/serviceCategory", serviceCategoryRoutes);
app.use("/api/tradeService", tradeServiceRoutes);
app.use("/api/genericProduct", genericProductRoutes);
app.use("/api/inventoryProduct", inventoryProductRoutes);
app.use("/api/creditDebitNote", creditDebitNoteRoutes);

// Global error handler - must be placed after all routes
app.use(errorHandler);

// Start server
// connectDB().then(() => {
app.listen(PORT, () => {
  syncModels();
  console.log(`Server running on http://localhost:${PORT}`);
});
// });
