import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import helmet from "helmet";
import express, { urlencoded } from "express";
import { limiter } from "./middleware/rateLimiter";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
// import { syncModels } from "./config/syncModels";

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
import packagingListRoute from "./routes/packagingList.routes";
import loadingOrderRoute from "./routes/loadingOrder.routes";
import requestedPurchaseProductRoute from "./routes/requestedPurchaseProduct.routes";
import siplProductRoute from "./routes/siplProduct.routes";
import paymentRoutes from "./routes/payment.routes";
import ledgerAccountRoutes from "./routes/ledgerAccount.routes";
import locationRoutes from "./routes/location.routes";
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
import soInvoiceRoutes from "./routes/salesOrderInvoice.routes";
import authRoutes from "./routes/auth.routes";
import accountRoutes from "./routes/account.routes";
import advancedDepositRoutes from "./routes/advancedDeposit.routes";
import returnRoutes from "./routes/return.routes";
import deliveryRoutes from "./routes/delivery.routes";
import driverDeliveryRoutes from "./routes/driverDelivery.routes";
import serviceRoutes from "./routes/service.routes";
import serviceCategoryRoutes from "./routes/serviceCategory.routes";
import tradeServiceRoutes from "./routes/tradeService.routes";
import genericProductRoutes from "./routes/genericProduct.routes";
import inventoryProductRoutes from "./routes/inventoryProduct.routes";
import creditDebitNoteRoutes from "./routes/creditDebitNote.routes";
import cartItemRoutes from "./routes/cartItem.routes";
import selectionSheetRoutes from "./routes/selectionSheet.routes";
import guestSelectionRoutes from "./routes/guestSelection.routes";
import holdRoutes from "./routes/hold.routes";
import optionsRoutes from "./routes/options.routes";
import permissionRoutes from "./routes/permission.routes";
import termsConditionRoutes from "./routes/termsCondition.routes";
import vendorContactRoutes from "./routes/vendorContact.routes";
import wiringInstructionRoutes from "./routes/wiringInstruction.routes";
import fabricatorRoutes from "./routes/fabricator.routes";
import customerExternalAgedInvoiceRoutes from "./routes/customerExternalAgedInvoice.routes";
import customerExternalInvoiceRoutes from "./routes/customerExternalInvoice.routes";
import fileUploadRoutes from "./routes/s3File.routes";
import opportunityRoutes from "./routes/opportunity.routes";
import salesOrderRequirementRoutes from "./routes/salesOrderRequirement.routes";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());

app.use(limiter);

app.use(express.json());
app.use(urlencoded({ extended: true }));

// Routes

// Client Users
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
app.use("/api/salesOrder", salesOrderRequirementRoutes);
app.use("/api/loadingOrder", loadingOrderRoute);
app.use("/api/packagingList", packagingListRoute);
app.use("/api/requestedPurchaseProduct", requestedPurchaseProductRoute);
app.use("/api/siplProduct", siplProductRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/ledgerAccount", ledgerAccountRoutes);
app.use("/api/location", locationRoutes);
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
app.use("/api/cartItem", cartItemRoutes);
app.use("/api/selectionSheet", selectionSheetRoutes);
app.use("/api/guestSelection", guestSelectionRoutes);
app.use("/api/hold", holdRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/permission", permissionRoutes);
app.use("/api/termsCondition", termsConditionRoutes);
app.use("/api/vendorContact", vendorContactRoutes);
app.use("/api/wiringInstruction", wiringInstructionRoutes);
app.use("/api/fabricator", fabricatorRoutes);
app.use("/api/customerExternalAgedInvoice", customerExternalAgedInvoiceRoutes);
app.use("/api/customerExternalInvoice", customerExternalInvoiceRoutes);
app.use("/api/fileUpload", fileUploadRoutes);
app.use("/api/opportunity", opportunityRoutes);

// Driver
app.use("/api/driver/delivery", driverDeliveryRoutes);


// Global error handler - must be placed after all routes
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    // syncModels();
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
