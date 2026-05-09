import * as XLSX from "xlsx";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import * as models from "../models";
import { INVENTORY_ITEM_STATUS } from "../constants";

// ─────────────────────────────────────────────────────────────────────────────
// Entry Point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Entry point for bulk inventory product upload.
 * Uses a modular multi-stage column-wise pipeline.
 * Each column has one dedicated handler that owns both its normalization
 * (transformation/parsing) and its validation (DB lookups / error checks).
 */
export const bulkUploadInventoryProducts = async (fileBuffer: Buffer, userId: number, clientId: number, accountId: number) => {
  return await sequelize.transaction(async (transaction) => {
    // Stage 0: Fetch client's default location + warehouse
    const defaultLocation: any = await models.Location.findOne({
      where: { clientId },
      attributes: ["id"],
      include: [{ association: "warehouse", attributes: ["id"] }],
      transaction,
    });
    if (!defaultLocation)
      throw new AppError("No location found for this client. Please configure a location first.", 400);
    const defaultLocationId = defaultLocation.id;
    const defaultWarehouseId: number | null = defaultLocation.warehouse?.id ?? null;
    if (!defaultWarehouseId)
      throw new AppError("No warehouse linked to the default location. Please configure a warehouse first.", 400);

    // Stage 1: Parse raw file → tagged rows
    const rawRows = parseInventoryFile(fileBuffer);

    // Stage 2: Flat extraction — pull raw cell values into a typed row shape
    const preparedRows = extractRawColumns(rawRows);

    // Stage 3: Column-wise handlers — each column normalises + validates itself
    const errors: string[] = [];
    await processAllColumns(preparedRows, clientId, defaultLocationId, defaultWarehouseId, errors, transaction);

    if (errors.length > 0) throw new AppError(`Validation failed:\n${errors.join("\n")}`, 400);

    // Stage 4: Attach runtime values (userId, clientId, locationId, accountId)
    const finalRows = attachRuntimeValues(preparedRows, userId, clientId, defaultLocationId, accountId);

    // Stage 5: Execute — bulk inserts in three ordered waves
    const createdCount = await executeBulkInventory(finalRows, transaction);

    return { createdCount };
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Stage 1: Parse
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_HEADERS = [
  "Product",
  "Serial#",
  "BarcodeID",
  "BLOCK",
  "LOT",
  "Slab Num",
  "Bin",
  "Dimensions",
  "Instock Qty",
  "Units",
  "Supplier",
  "Unit FOB Cost",
  "Unit Landed Cost",
  "Slab Status",
  "Notes",
  "Remnant",
  "Received Date",
];

const REQUIRED_HEADERS = ["Product"];

const parseInventoryFile = (fileBuffer: Buffer) => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
  if (headers) {
    const unrecognized = headers.filter((h: string) => h && !ALLOWED_HEADERS.includes(h));
    if (unrecognized.length > 0)
      throw new AppError(`Unrecognized column(s): ${unrecognized.join(", ")}`, 400);

    const missing = REQUIRED_HEADERS.filter((rh) => !headers.includes(rh));
    if (missing.length > 0)
      throw new AppError(`Missing required column(s): ${missing.join(", ")}`, 400);
  }

  const data = XLSX.utils.sheet_to_json(worksheet);
  if (data.length === 0) throw new AppError("No inventory products found in file.", 400);

  let rowNumber = 1;
  return data.map((row: any) => ({ ...row, _rowNumber: ++rowNumber }));
};

// ─────────────────────────────────────────────────────────────────────────────
// Stage 2: Flat extraction — raw cell values only, no transforms/validation
// ─────────────────────────────────────────────────────────────────────────────

const extractRawColumns = (rawRows: any[]) => {
  return rawRows.map((raw) => ({
    _rowNumber: raw._rowNumber,
    // --- raw values pulled straight from the sheet ---
    productName: (raw["Product"] ?? "").toString().trim(),
    serialRaw: raw["Serial#"]?.toString().trim() ?? null,
    barcode: raw["BarcodeID"]?.toString().trim() ?? null,
    block: raw["BLOCK"]?.toString().trim() ?? null,
    lot: raw["LOT"]?.toString().trim() ?? null,
    slabNumRaw: raw["Slab Num"]?.toString().trim() ?? null,
    binName: raw["Bin"]?.toString().trim() ?? null,
    dimensionsRaw: raw["Dimensions"]?.toString().trim() ?? null,
    supplierName: raw["Supplier"]?.toString().trim() ?? null,
    fobCostRaw: raw["Unit FOB Cost"]?.toString().trim() ?? null,
    landedCostRaw: raw["Unit Landed Cost"]?.toString().trim() ?? null,
    slabStatusRaw: raw["Slab Status"]?.toString().trim() ?? null,
    notes: raw["Notes"]?.toString().trim() ?? null,
    receivedDateRaw: raw["Received Date"]?.toString().trim() ?? null,
    // --- resolved / computed (filled by column handlers) ---
    productId: null as number | null,
    isSlabType: null as boolean | null,
    binId: null as number | null,
    vendorId: null as number | null,
    combinedNumber: null as string | null,
    slabNumber: null as number | null,
    receivingLength: null as number | null,
    receivingWidth: null as number | null,
    FOBcost: null as number | null,
    landedUnitCost: null as number | null,
    slabStatus: null as string | null,
    receivedDate: null as Date | null,
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// Stage 3: Column handlers
//   Each handler owns the full lifecycle for its column:
//     1. Read the raw value from the row
//     2. Parse / transform it
//     3. Validate it (optionally touching the DB)
//     4. Write the resolved value back onto the row
// ─────────────────────────────────────────────────────────────────────────────

const processAllColumns = async (
  rows: any[],
  clientId: number,
  locationId: number,
  warehouseId: number,
  errors: string[],
  transaction: any
) => {
  await Promise.all([
    processProductColumn(rows, clientId, errors, transaction),                        // col: "Product"  → productId, isSlabType
    processBinColumn(rows, clientId, locationId, warehouseId, errors, transaction),   // col: "Bin"      → binId (auto-creates with warehouseId)
    processSerialColumn(rows, clientId, errors, transaction),                         // col: "Serial#"  → combinedNumber (transforms + uniqueness checks)
  ]);

  // Sync columns (no async work needed)
  rows.forEach((row) => {
    processDimensionsColumn(row, errors);    // col: "Dimensions"       → receivingLength, receivingWidth
    processFOBCostColumn(row, errors);       // col: "Unit FOB Cost"    → FOBcost
    processLandedCostColumn(row, errors);    // col: "Unit Landed Cost" → landedUnitCost
    processSlabNumColumn(row, errors);       // col: "Slab Num"         → slabNumber
    processSlabStatusColumn(row, errors);    // col: "Slab Status"      → slabStatus (defaults to IN_INVENTORY)
    processReceivedDateColumn(row, errors);  // col: "Received Date"    → receivedDate
  });
};

// ── Product ──────────────────────────────────────────────────────────────────
// Resolves product name → productId + isSlabType
const processProductColumn = async (
  rows: any[],
  clientId: number,
  errors: string[],
  transaction: any
) => {
  const uniqueNames = Array.from(
    new Set(rows.map((r) => r.productName.toLowerCase()).filter(Boolean))
  );
  if (uniqueNames.length === 0) {
    errors.push(`"Product" column is empty or missing.`);
    return;
  }

  const found = await models.Product.findAll({
    where: { name: uniqueNames, clientId },
    attributes: ["id", "name", "isSlabType"],
    transaction,
  });
  const map = new Map(found.map((p: any) => [p.name.toLowerCase(), p]));

  rows.forEach((row) => {
    if (!row.productName) {
      errors.push(`Row ${row._rowNumber}: "Product" is required.`);
      return;
    }
    const product = map.get(row.productName.toLowerCase());
    if (!product) {
      errors.push(
        `Row ${row._rowNumber}: Product "${row.productName}" not found in the database. Please create it first.`
      );
    } else {
      row.productId = product.id;
      row.isSlabType = product.isSlabType;
    }
  });
};


// ── Serial# ───────────────────────────────────────────────────────────────────
// Transforms "3262-26" → "3262-1-26" and writes to combinedNumber
// ── Serial# ───────────────────────────────────────────────────────────────────
// 1. Transforms "3262-26" → "3262-1-26" and writes to combinedNumber
// 2. Checks intra-file uniqueness (no two rows in the upload share the same serial)
// 3. Checks DB uniqueness (serial must not already exist in inventory_products)
const processSerialColumn = async (
  rows: any[],
  clientId: number,
  errors: string[],
  transaction: any
) => {
  // Step 1: Transform every row's serialRaw → combinedNumber
  rows.forEach((row) => {
    let serial = row.serialRaw;
    if (!serial) return; // optional column — skip blank rows

    const parts = serial.split("-");
    if (parts.length === 2) {
      serial = `${parts[0]}-1-${parts[1]}`;
    }
    row.combinedNumber = serial;
  });

  // Collect only rows that actually have a serial
  const rowsWithSerial = rows.filter((r) => r.combinedNumber);
  if (rowsWithSerial.length === 0) return;

  // Step 2: Intra-file duplicate check
  const seenInFile = new Map<string, number>(); // combinedNumber → first _rowNumber
  rowsWithSerial.forEach((row) => {
    const key = row.combinedNumber.toLowerCase();
    if (seenInFile.has(key)) {
      errors.push(
        `Row ${row._rowNumber}: Serial# "${row.combinedNumber}" is duplicated in this file (first seen on row ${seenInFile.get(key)}).`
      );
    } else {
      seenInFile.set(key, row._rowNumber);
    }
  });

  // Step 3: DB uniqueness check — serial must not already exist
  const uniqueSerials = Array.from(seenInFile.keys());
  const existing = await models.InventoryProduct.findAll({
    where: { combinedNumber: uniqueSerials, clientId },
    attributes: ["combinedNumber"],
    transaction,
  });

  if (existing.length > 0) {
    const existingSet = new Set(
      existing.map((ip: any) => ip.combinedNumber.toLowerCase())
    );
    rowsWithSerial.forEach((row) => {
      if (existingSet.has(row.combinedNumber.toLowerCase())) {
        errors.push(
          `Row ${row._rowNumber}: Serial# "${row.combinedNumber}" already exists in the database.`
        );
      }
    });
  }
};

// ── Dimensions ────────────────────────────────────────────────────────────────
// Parses "118 x 68" → receivingLength / receivingWidth
const processDimensionsColumn = (row: any, errors: string[]) => {
  const raw = row.dimensionsRaw;
  if (!raw) return; // optional

  if (!raw.toLowerCase().includes("x")) {
    errors.push(
      `Row ${row._rowNumber}: "Dimensions" must be in "length x width" format (e.g., "118 x 68"). Got "${raw}".`
    );
    return;
  }

  const parts = raw.toLowerCase().split("x").map((s: string) => parseFloat(s.trim()));
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    errors.push(
      `Row ${row._rowNumber}: Could not parse "Dimensions" value "${raw}". Expected format: "118 x 68".`
    );
    return;
  }

  row.receivingLength = parts[0];
  row.receivingWidth = parts[1];
};

// ── Slab Num ──────────────────────────────────────────────────────────────────
// Parses string → integer
const processSlabNumColumn = (row: any, errors: string[]) => {
  if (!row.slabNumRaw) return;
  const parsed = parseInt(row.slabNumRaw, 10);
  if (isNaN(parsed)) {
    errors.push(`Row ${row._rowNumber}: "Slab Num" must be an integer. Got "${row.slabNumRaw}".`);
    return;
  }
  row.slabNumber = parsed;
};

// ── Bin ───────────────────────────────────────────────────────────────────────
// Resolves bin name → binId; auto-creates missing bins with warehouseId + locationId
const processBinColumn = async (
  rows: any[],
  clientId: number,
  locationId: number,
  warehouseId: number,
  errors: string[],
  transaction: any
) => {
  const names = rows.map((r) => r.binName).filter(Boolean) as string[];
  if (names.length === 0) return;

  const uniqueNames = Array.from(new Set(names.map((n) => n.toLowerCase())));

  const found = await models.Bin.findAll({
    where: { name: uniqueNames, clientId },
    attributes: ["id", "name"],
    transaction,
  });
  const nameToId = new Map(found.map((b: any) => [b.name.toLowerCase(), b.id]));

  // Auto-create bins that are missing — assign warehouseId and locationId
  const missingKeys = uniqueNames.filter((n) => !nameToId.has(n));
  if (missingKeys.length > 0) {
    const originalNames = Array.from(
      new Set(
        rows
          .filter((r) => r.binName && missingKeys.includes(r.binName.toLowerCase()))
          .map((r) => r.binName as string)
      )
    );
    const created = await models.Bin.bulkCreate(
      originalNames.map((name) => ({ name, clientId, warehouseId, locationId })),
      { transaction, returning: true }
    );
    created.forEach((b: any) => nameToId.set(b.name.toLowerCase(), b.id));
  }

  rows.forEach((row) => {
    if (!row.binName) return;
    row.binId = nameToId.get(row.binName.toLowerCase()) ?? null;
  });
};



// ── Unit FOB Cost ─────────────────────────────────────────────────────────────
// Strips currency symbols and parses to float
const processFOBCostColumn = (row: any, errors: string[]) => {
  if (!row.fobCostRaw) return;
  const parsed = parseFloat(row.fobCostRaw.replace(/[^0-9.]/g, ""));
  if (isNaN(parsed)) {
    errors.push(`Row ${row._rowNumber}: "Unit FOB Cost" is not a valid number. Got "${row.fobCostRaw}".`);
    return;
  }
  row.FOBcost = parsed;
};

// ── Unit Landed Cost ──────────────────────────────────────────────────────────
// Strips currency symbols and parses to float
const processLandedCostColumn = (row: any, errors: string[]) => {
  if (!row.landedCostRaw) return;
  const parsed = parseFloat(row.landedCostRaw.replace(/[^0-9.]/g, ""));
  if (isNaN(parsed)) {
    errors.push(
      `Row ${row._rowNumber}: "Unit Landed Cost" is not a valid number. Got "${row.landedCostRaw}".`
    );
    return;
  }
  row.landedUnitCost = parsed;
};

// ── Slab Status ───────────────────────────────────────────────────────────────
// Defaults to IN_INVENTORY if not provided; validates against known statuses
// ── Slab Status ───────────────────────────────────────────────────────────────
// Defaults to IN_INVENTORY if not provided.
// ── Slab Status ───────────────────────────────────────────────────────────────
// Only two accepted inputs:
//   blank / empty  → defaults to IN_INVENTORY
//   "ONHOLD"       → status stays IN_INVENTORY, but a hold record is created (Wave 4)
// Any other value is rejected.
const processSlabStatusColumn = (row: any, errors: string[]) => {
  const raw = (row.slabStatusRaw || "").toString().trim().toUpperCase();

  if (!raw) {
    row.slabStatus = INVENTORY_ITEM_STATUS.IN_INVENTORY;
    row.isOnHold = false;
    return;
  }

  if (raw === "ONHOLD" || raw === "ON HOLD" || raw === "ON_HOLD") {
    row.slabStatus = INVENTORY_ITEM_STATUS.IN_INVENTORY; // DB status stays IN_INVENTORY
    row.isOnHold = true;
    return;
  }

  if (raw === "ONSO") {
    row.slabStatus = INVENTORY_ITEM_STATUS.IN_INVENTORY;
    row.secondaryStatus = "ONSO";
    row.isOnHold = false;
    return;
  }

  // Any other value is invalid
  errors.push(
    `Row ${row._rowNumber}: "Slab Status" "${row.slabStatusRaw}" is not valid. Acceptable values: blank (defaults to IN_INVENTORY), "ONHOLD", or "ONSO".`
  );
};

// ── Received Date ─────────────────────────────────────────────────────────────
// Parses date strings (e.g., "08/21/2024") or Date objects from XLSX
const processReceivedDateColumn = (row: any, errors: string[]) => {
  let raw = row.receivedDateRaw;
  if (!raw) return;

  // If XLSX.read with cellDates: true already gave us a Date object
  if (raw instanceof Date) {
    if (isNaN(raw.getTime())) {
      errors.push(`Row ${row._rowNumber}: "Received Date" is an invalid date object.`);
    } else {
      row.receivedDate = raw;
    }
    return;
  }

  // Otherwise, try to parse the string
  const d = new Date(raw);
  if (isNaN(d.getTime())) {
    // If it's a number (Excel serial), XLSX might have missed it or it was cast to string
    const serial = parseFloat(raw);
    if (!isNaN(serial) && serial > 30000) { // Simple heuristic for Excel serials
      // Convert Excel serial to JS Date
      // 25569 is the number of days between 1899-12-30 and 1970-01-01
      const date = new Date((serial - 25569) * 86400 * 1000);
      row.receivedDate = date;
      return;
    }

    errors.push(
      `Row ${row._rowNumber}: "Received Date" "${raw}" is not a valid date. Expected format: MM/DD/YYYY.`
    );
    return;
  }
  row.receivedDate = d;
};

// ─────────────────────────────────────────────────────────────────────────────
// Stage 4: Attach runtime values
// ─────────────────────────────────────────────────────────────────────────────

const attachRuntimeValues = (
  preparedRows: any[],
  userId: number,
  clientId: number,
  locationId: number,
  accountId: number
) => {
  return preparedRows.map((row) => ({
    ...row,
    clientId,
    locationId,
    createdById: userId,
    updatedById: userId,
    accountId, // Use this for models referencing Account
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// Stage 5: Bulk Execution
//   Wave 1 — bulkCreate all InventoryProducts → get back IDs
//   Wave 2 — bulkCreate all InventoryProductMetaData (requires IDs from wave 1)
//   Wave 3 — bulkCreate Slabs + GenericProducts in parallel (requires IDs from wave 1)
// ─────────────────────────────────────────────────────────────────────────────

const executeBulkInventory = async (rows: any[], transaction: any) => {
  // ── Wave 1: InventoryProducts ────────────────────────────────────────────
  const inventoryProductPayloads = rows.map((row) => ({
    binId: row.binId,
    productId: row.productId,
    clientId: row.clientId,
    sellingPrice: null,
    landedUnitCost: row.landedUnitCost,
    FOBcost: row.FOBcost,
    status: row.slabStatus || INVENTORY_ITEM_STATUS.IN_INVENTORY,
    secondaryStatus: row.secondaryStatus ?? null,
    note: row.notes ?? null,
    isSlabType: row.isSlabType,
    combinedNumber: row.combinedNumber,
    locationId: row.locationId,
  }));

  const createdInventoryProducts: any[] = await models.InventoryProduct.bulkCreate(
    inventoryProductPayloads,
    { transaction, returning: true }
  );

  // Map each original row to its newly created InventoryProduct
  const rowsWithIds = rows.map((row, idx) => ({
    ...row,
    inventoryProductId: createdInventoryProducts[idx].id,
    inventoryProductStatus: createdInventoryProducts[idx].status,
  }));

  // ── Wave 2: MetaData ──────────────────────────────────────────────────────
  await models.InventoryProductMetaData.bulkCreate(
    rowsWithIds.map((row) => ({
      inventoryProductId: row.inventoryProductId,
      vendorName: row.supplierName,   // store the raw supplier name as-is
      receivedDate: row.receivedDate,
      clientId: row.clientId,
    })),
    { transaction }
  );

  // ── Wave 3: Slabs + GenericProducts in parallel ───────────────────────────
  const slabRows = rowsWithIds.filter((r) => r.isSlabType);
  const genericRows = rowsWithIds.filter((r) => !r.isSlabType);

  await Promise.all([
    slabRows.length > 0
      ? models.Slab.bulkCreate(
        slabRows.map((row) => ({
          inventoryProductId: row.inventoryProductId,
          productId: row.productId,
          clientId: row.clientId,
          barcode: row.barcode,
          block: row.block,
          lot: row.lot,
          slabNumber: row.slabNumber,
          receivingLength: row.receivingLength,
          receivingWidth: row.receivingWidth,
          notes: row.notes,
          status: row.inventoryProductStatus,
          locationId: row.locationId,
        })),
        { transaction }
      )
      : Promise.resolve(),

    genericRows.length > 0
      ? models.GenericProduct.bulkCreate(
        genericRows.map((row) => ({
          inventoryProductId: row.inventoryProductId,
          productId: row.productId,
          clientId: row.clientId,
          barcode: row.barcode,
          status: row.inventoryProductStatus,
          locationId: row.locationId,
          createdById: row.createdById,
          updatedById: row.updatedById,
        })),
        { transaction }
      )
      : Promise.resolve(),
  ]);

  // ── Wave 4: Holds (for rows flagged ONHOLD) ──────────────────────────────────
  const onHoldRows = rowsWithIds.filter((r) => r.isOnHold);
  if (onHoldRows.length > 0) {
    await models.InventoryProductHold.bulkCreate(
      onHoldRows.map((row) => ({
        inventoryProductId: row.inventoryProductId,
        note: row.notes ?? null,
        createdById: row.accountId, // References Account(id)
        clientId: row.clientId,
        locationId: row.locationId,
      })),
      { transaction }
    );
  }

  return createdInventoryProducts.length;
};
