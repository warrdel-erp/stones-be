import * as XLSX from "xlsx";
import { PRODUCT_KIND } from "../constants";
import { COUNTRIES } from "../constants/countries";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import * as productRepository from "../repositories/product.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import { DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import { productSchema } from "../validators/product.validator";
import * as models from "../models";

/**
 * Entry point for bulk product upload.
 * Uses a modular multi-stage pipeline.
 */
export const bulkUploadProducts = async (fileBuffer: Buffer, userId: number, clientId: number) => {
  // Stage 0: Get default ledger accounts
  const [ledgerAccountForFinishedGoods, ledgerAccountForCogs, incomeAccount] = await Promise.all([
    ledgerAccountRepository.getLedgerAccountByFilterForBulkUpload({ key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS, clientId }),
    ledgerAccountRepository.getLedgerAccountByFilterForBulkUpload({ key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS, clientId }),
    ledgerAccountRepository.getLedgerAccountByFilterForBulkUpload({ key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD, clientId }),
  ]);

  if (!ledgerAccountForFinishedGoods || !ledgerAccountForCogs || !incomeAccount) {
    throw new AppError("Default ledger accounts not configured for this client.", 400);
  }

  const ledgerAccounts = {
    inventoryLinkAccountId: (ledgerAccountForFinishedGoods as any).id,
    incomeAccountId: (incomeAccount as any).id,
    costOfGoodsAccountId: (ledgerAccountForCogs as any).id,
  };

  // Wrap everything in a single transaction as requested
  return await sequelize.transaction(async (transaction) => {
    // Stage 1: Parse File
    const csvRows = parseProductFile(fileBuffer);

    // Stage 2: Normalization
    const preparedRows = normalizeProductRows(csvRows);

    // Stage 3: Transposition & Column Validation (Directly updates preparedRows)
    const columns = transposeRowsToColumns(preparedRows);
    const errors: string[] = [];

    await validateProductColumns(columns, preparedRows, clientId, userId, errors, transaction);

    if (errors.length > 0) throw new AppError(`Validation failed:\n${errors.join("\n")}`, 400);

    // Stage 4: Final Preparation (Derivations)
    const finalRows = await finalizeProductRows(preparedRows, userId, clientId, ledgerAccounts, transaction);

    // Stage 5: Row-wise Schema Validation
    const products = validateRowsSchema(finalRows, errors);

    if (errors.length > 0) throw new AppError(`Validation failed:\n${errors.join("\n")}`, 400);

    // Stage 6: Execution
    const createdProducts = await productRepository.bulkCreateProductsForBulkUpload(products, transaction);
    return { createdProductsCount: createdProducts.length };
  });
};

const ALLOWED_HEADERS = [
  "name", "Name",
  "alternativeName", "AlternativeName",
  "baseColor", "BaseColor",
  "group", "Group",
  "subCategory", "SubCategory",
  "isSlabType", "IsSlabType",
  "origin", "Origin",
  "weight", "Weight",
  "finish", "Finish",
  "thickness", "Thickness",
  "notes", "Notes",
  "specialInstruction", "SpecialInstruction",
  "disclaimer", "Disclaimer",
  "singleUnitPrice", "SingleUnitPrice",
  "bundlePrice", "BundlePrice",
  "reorderQuantity", "ReorderQuantity",
  "safetyQuantity", "SafetyQuantity",
  "bin", "Bin",
  "kind", "Kind",
  "status", "Status",
];

const REQUIRED_HEADERS = [
  "name",
  "isSlabType",
  "subCategory",
  "kind",
];

const parseProductFile = (fileBuffer: Buffer) => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
  if (headers) {
    const unrecognized = headers.filter((h: string) => h && !ALLOWED_HEADERS.includes(h));
    if (unrecognized.length > 0) throw new AppError(`Unrecognized column(s): ${unrecognized.join(", ")}`, 400);
    const missing = REQUIRED_HEADERS.filter(rh => {
      const cap = rh.charAt(0).toUpperCase() + rh.slice(1);
      return !headers.includes(rh) && !headers.includes(cap);
    });
    if (missing.length > 0) throw new AppError(`Missing column(s): ${missing.join(", ")}`, 400);
  }

  const data = XLSX.utils.sheet_to_json(worksheet);
  let rowNumber = 1;
  const csvRows = data.map((row: any) => ({ ...row, _rowNumber: ++rowNumber }));

  if (csvRows.length === 0) throw new AppError("No products found in file.", 400);
  return csvRows;
};

const normalizeProductRows = (csvRows: any[]) => {
  return csvRows.map((data) => ({
    _rowNumber: data._rowNumber,
    name: (data.name || data.Name || "").trim(),
    alternativeName: data.alternativeName || data.AlternativeName || null,
    baseColorId: data.baseColor || data.BaseColor || null,
    groupId: data.group || data.Group || null,
    subCategoryId: data.subCategory || data.SubCategory || null,
    isSlabType: data.isSlabType || data.IsSlabType || false,
    originId: data.origin || data.Origin || null,
    weight: data.weight ? parseFloat(data.weight) : (data.Weight ? parseFloat(data.Weight) : null),
    finishId: data.finish || data.Finish || null,
    kindId: data.kind || data.Kind || null,
    thickness: data.thickness ? parseFloat(data.thickness) : (data.Thickness ? parseFloat(data.Thickness) : null),
    notes: data.notes || data.Notes || null,
    specialInstruction: data.specialInstruction || data.SpecialInstruction || null,
    disclaimer: data.disclaimer || data.Disclaimer || null,
    singleUnitPrice: data.singleUnitPrice ? parseFloat(data.singleUnitPrice) : (data.SingleUnitPrice ? parseFloat(data.SingleUnitPrice) : null),
    bundlePrice: data.bundlePrice ? parseFloat(data.bundlePrice) : (data.BundlePrice ? parseFloat(data.BundlePrice) : null),
    reorderQuantity: data.reorderQuantity ? parseFloat(data.reorderQuantity) : (data.ReorderQuantity ? parseFloat(data.ReorderQuantity) : null),
    safetyQuantity: data.safetyQuantity ? parseFloat(data.safetyQuantity) : (data.SafetyQuantity ? parseFloat(data.SafetyQuantity) : null),
    binId: data.bin || data.Bin || null,
    status: (data.status || data.Status || "active").toString().toLowerCase() || "active",
  }));
};

const transposeRowsToColumns = (rows: any[]) => {
  const columns: any = {};
  if (rows.length === 0) return columns;

  const allKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  allKeys.forEach((key) => {
    columns[key] = rows.map((row) => row[key]);
  });

  return columns;
};

const validateProductColumns = async (
  columns: any,
  preparedRows: any[],
  clientId: number,
  userId: number,
  errors: string[],
  transaction: any
) => {
  await Promise.all([
    validateSubcategoryColumn(preparedRows, clientId, errors, transaction),
    validateGroupColumn(preparedRows, clientId, userId, errors, transaction),
    validateBaseColorColumn(preparedRows, clientId, userId, errors, transaction),
    validateFinishColumn(preparedRows, clientId, userId, errors, transaction),
    validateBinColumn(preparedRows, clientId, errors),
    validateNamesColumn(columns.name, columns._rowNumber, clientId, errors),
  ]);

  validateKindColumn(preparedRows, errors);
  validateOriginColumn(preparedRows, errors);
};

const validateNamesColumn = async (names: string[], rowNumbers: number[], clientId: number, errors: string[]) => {
  const nameToIndices = new Map<string, number[]>();
  names.forEach((name, index) => {
    const trimmed = (name || "").trim().toLowerCase();
    if (trimmed) {
      if (!nameToIndices.has(trimmed)) nameToIndices.set(trimmed, []);
      nameToIndices.get(trimmed)!.push(index);
    }
  });

  nameToIndices.forEach((indices, name) => {
    if (indices.length > 1) {
      errors.push(`Duplicate product name found in your file: "${names[indices[0]]}" (appears on rows: ${indices.map(i => rowNumbers[i]).join(', ')}). Each product must have a unique name.`);
    }
  });

  const uniqueNames = Array.from(nameToIndices.keys());
  if (uniqueNames.length > 0) {
    const existingProducts = await models.Product.findAll({
      where: { name: uniqueNames, clientId },
      attributes: ["name"],
    });
    existingProducts.forEach((p: any) => {
      errors.push(`A product with the name "${p.name}" already exists in the system. Please choose a different name.`);
    });
  }
};

const validateSubcategoryColumn = async (rows: any[], clientId: number, errors: string[], transaction: any) => {
  const subCatMap = new Map<string, { isSlabType: boolean, rows: any[] }>();

  rows.forEach(row => {
    const name = row.subCategoryId?.toString().trim();
    if (!name) return;
    
    const isSlab = !!(row.isSlabType === true || row.isSlabType === 'true' || row.isSlabType?.toString().toLowerCase() === 'yes');
    
    if (!subCatMap.has(name.toLowerCase())) {
      subCatMap.set(name.toLowerCase(), { isSlabType: isSlab, rows: [] });
    }
    
    const existing = subCatMap.get(name.toLowerCase())!;
    if (existing.isSlabType !== isSlab) {
      errors.push(`The subcategory "${name}" has conflicting Slab Type values in your file. Please ensure it is set consistently as either "Yes" or "No" (check row ${row._rowNumber}).`);
    }
    existing.rows.push(row);
  });

  const uniqueNames = Array.from(subCatMap.keys());
  if (uniqueNames.length === 0) return;

  const existingRecords = await models.ProductSubCategory.findAll({
    where: { name: uniqueNames, clientId },
    transaction,
  });

  const existingMap = new Map(existingRecords.map((sc: any) => [sc.name.toLowerCase(), sc]));
  const toCreate: any[] = [];

  for (const [name, data] of subCatMap.entries()) {
    const record = existingMap.get(name);
    if (record) {
      if (record.isSlabType !== data.isSlabType) {
        const expected = record.isSlabType ? "Slab" : "Non-Slab";
        const provided = data.isSlabType ? "Slab" : "Non-Slab";
        errors.push(`The subcategory "${record.name}" already exists as a ${expected} type, but your file lists it as ${provided}. Please correct this on row(s): ${data.rows.map(r => r._rowNumber).join(', ')}.`);
      }
      data.rows.forEach(r => r.subCategoryId = record.id);
    } else {
      toCreate.push({ name: data.rows[0].subCategoryId.toString().trim(), isSlabType: data.isSlabType });
    }
  }

  if (toCreate.length > 0) {
    const created = await models.ProductSubCategory.bulkCreate(
      toCreate.map(tc => ({ ...tc, clientId })),
      { transaction, returning: true }
    );
    created.forEach((sc: any) => {
      const data = subCatMap.get(sc.name.toLowerCase())!;
      data.rows.forEach(r => r.subCategoryId = sc.id);
    });
  }
};

const validateGroupColumn = async (rows: any[], clientId: number, userId: number, errors: string[], transaction: any) => {
  const names = rows.map(r => r.groupId).filter(v => v != null);
  const uniqueNames = Array.from(new Set(names.map(v => v.toString().trim())));
  if (uniqueNames.length === 0) return;

  const found = await models.ProductGroup.findAll({
    where: { name: uniqueNames, clientId },
    attributes: ["id", "name"],
    transaction,
  });

  const nameToId = new Map(found.map((g: any) => [g.name.toLowerCase(), g.id]));
  const missing = uniqueNames.filter(n => !nameToId.has(n.toLowerCase()));

  if (missing.length > 0) {
    const created = await models.ProductGroup.bulkCreate(
      missing.map(name => ({ name, clientId, createdBy: userId })),
      { transaction, returning: true }
    );
    created.forEach((g: any) => nameToId.set(g.name.toLowerCase(), g.id));
  }

  rows.forEach((row) => {
    const val = row.groupId?.toString().trim();
    if (!val) return;
    if (nameToId.has(val.toLowerCase())) {
      row.groupId = nameToId.get(val.toLowerCase());
    }
  });
};

const validateBaseColorColumn = async (rows: any[], clientId: number, userId: number, errors: string[], transaction: any) => {
  const names = rows.map(r => r.baseColorId).filter(v => v != null);
  const uniqueNames = Array.from(new Set(names.map(v => v.toString().trim())));
  if (uniqueNames.length === 0) return;

  const found = await models.ProductBaseColor.findAll({
    where: { name: uniqueNames, clientId },
    attributes: ["id", "name"],
    transaction,
  });

  const nameToId = new Map(found.map((c: any) => [c.name.toLowerCase(), c.id]));
  const missing = uniqueNames.filter(n => !nameToId.has(n.toLowerCase()));

  if (missing.length > 0) {
    const created = await models.ProductBaseColor.bulkCreate(
      missing.map(name => ({ name, clientId, createdBy: userId })),
      { transaction, returning: true }
    );
    created.forEach((c: any) => nameToId.set(c.name.toLowerCase(), c.id));
  }

  rows.forEach((row) => {
    const val = row.baseColorId?.toString().trim();
    if (!val) return;
    if (nameToId.has(val.toLowerCase())) {
      row.baseColorId = nameToId.get(val.toLowerCase());
    }
  });
};

const validateFinishColumn = async (rows: any[], clientId: number, userId: number, errors: string[], transaction: any) => {
  const names = rows.map(r => r.finishId).filter(v => v != null);
  const uniqueNames = Array.from(new Set(names.map(v => v.toString().trim())));
  if (uniqueNames.length === 0) return;

  const found = await models.ProductFinish.findAll({
    where: { name: uniqueNames, clientId },
    attributes: ["id", "name"],
    transaction,
  });

  const nameToId = new Map(found.map((f: any) => [f.name.toLowerCase(), f.id]));
  const missing = uniqueNames.filter(n => !nameToId.has(n.toLowerCase()));

  if (missing.length > 0) {
    const created = await models.ProductFinish.bulkCreate(
      missing.map(name => ({ name, clientId, createdBy: userId })),
      { transaction, returning: true }
    );
    created.forEach((f: any) => nameToId.set(f.name.toLowerCase(), f.id));
  }

  rows.forEach((row) => {
    const val = row.finishId?.toString().trim();
    if (!val) return;
    if (nameToId.has(val.toLowerCase())) {
      row.finishId = nameToId.get(val.toLowerCase());
    }
  });
};

const validateBinColumn = async (rows: any[], clientId: number, errors: string[]) => {
  const names = rows.map(r => r.binId).filter(v => v != null);
  const uniqueNames = Array.from(new Set(names.map(v => v.toString().trim())));
  if (uniqueNames.length === 0) return;

  const found = await models.Bin.findAll({
    where: { name: uniqueNames, clientId },
    attributes: ["id", "name"],
  });

  const nameToId = new Map(found.map((b: any) => [b.name.toLowerCase(), b.id]));

  rows.forEach((row) => {
    const val = row.binId?.toString().trim();
    if (!val) return;

    if (nameToId.has(val.toLowerCase())) {
      row.binId = nameToId.get(val.toLowerCase());
    } else {
      errors.push(`The bin "${val}" was not found in the system. Please create it first before uploading (check row: ${row._rowNumber}).`);
    }
  });
};

const validateOriginColumn = (rows: any[], errors: string[]) => {
  rows.forEach((row) => {
    const val = row.originId?.toString().trim();
    if (!val) return;

    const matched = COUNTRIES.find(c => c.name.toLowerCase() === val.toLowerCase());
    if (matched) {
      row.originId = matched.id;
    } else {
      errors.push(`Invalid Origin/Country: "${val}" (row: ${row._rowNumber})`);
    }
  });
};

const validateKindColumn = (rows: any[], errors: string[]) => {
  rows.forEach((row) => {
    const val = row.kindId;
    if (val == null) return;

    const strVal = val.toString().trim().toLowerCase();
    const kindByName = PRODUCT_KIND.find(k => k.value.toLowerCase() === strVal);

    if (kindByName) {
      row.kindId = kindByName.id;
      return;
    }

    errors.push(`Invalid Kind value: "${val}" (row: ${row._rowNumber}). Acceptable values: "Stock", "Non-Stock"`);
  });
};

const validateRowsSchema = (preparedRows: any[], errors: string[]) => {
  const validatedData: any[] = [];
  preparedRows.forEach((row) => {
    const { _rowNumber, ...rest } = row;
    const validation = productSchema.safeParse(rest);
    if (!validation.success) {
      const rowErrors = validation.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
      errors.push(`Row ${_rowNumber}: ${rowErrors}`);
    } else {
      validatedData.push({ ...validation.data, ...rest });
    }
  });
  return validatedData;
};

const finalizeProductRows = async (
  preparedRows: any[],
  userId: number,
  clientId: number,
  ledgerAccounts: { inventoryLinkAccountId: number; incomeAccountId: number; costOfGoodsAccountId: number },
  transaction: any
) => {
  const subCategoryIds = Array.from(new Set(preparedRows.map((r) => r.subCategoryId).filter((id) => id != null)));
  const subCategories = await models.ProductSubCategory.findAll({
    where: { id: subCategoryIds, clientId },
    attributes: ["id", "isSlabType"],
    transaction,
  });

  const subCategorySlabTypeMap = new Map(subCategories.map((sc: any) => [sc.id, sc.isSlabType]));
  return preparedRows.map((row) => {
    const isSlabType = subCategorySlabTypeMap.get(row.subCategoryId) || false;
    return {
      ...row,
      isSlabType,
      uomId: isSlabType ? 1 : 14,
      createdBy: userId,
      updatedBy: userId,
      clientId,
      ...ledgerAccounts,
    };
  });
};
