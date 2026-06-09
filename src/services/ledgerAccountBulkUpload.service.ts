import * as XLSX from "xlsx";
import { AppError } from "../helper/appError";
import { sequelize } from "../config/database";
import * as models from "../models";
import { COA_SUB_HEADERS } from "../constants/coa";
import { Transaction } from "sequelize";
import { scoped } from "../utils/scoped";

interface NormalizedRow {
  rowNum: number;
  name: string;
  type: "dr" | "cr";
  openingBalance: number;
  subHeaderId: number;
  parentLeader: string | null;
  isChild: boolean;
}

/**
 * 1. Parse File (XLSX handles both CSV and Excel)
 */
function parseExcelOrCsv(fileBuffer: Buffer): any[] {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  if (data.length === 0) {
    throw new AppError("No data found in the file.", 400);
  }
  return data;
}

/**
 * 2. Validate presence of required headers
 */
function validateHeaders(data: any[]): void {
  const firstRowKeys = Object.keys(data[0] as any);
  const requiredColumns = ["Account Name", "Account Type", "Amount", "Subheader"];
  const missing = requiredColumns.filter(col => !firstRowKeys.includes(col));
  if (missing.length > 0) {
    throw new AppError(`Missing required column(s): ${missing.join(", ")}`, 400);
  }
}

/**
 * 3. Normalize and validate rows
 */
function normalizeAndValidateRows(data: any[]): NormalizedRow[] {
  const errors: string[] = [];
  const normalizedRows: NormalizedRow[] = [];

  data.forEach((row: any, idx: number) => {
    const rowNum = idx + 2; // Row number in sheet (header is row 1)
    const name = (row["Account Name"] || "").toString().trim();
    const type = (row["Account Type"] || "").toString().trim().toLowerCase();
    const rawAmount = row["Amount"];
    const subheaderName = (row["Subheader"] || "").toString().trim();
    const parentLeader = (row["Parent leader"] || "").toString().trim();

    if (!name) {
      errors.push(`Row ${rowNum}: Account Name is required.`);
      return;
    }
    if (type !== "dr" && type !== "cr") {
      errors.push(`Row ${rowNum}: Account Type must be "dr" or "cr".`);
      return;
    }
    
    // Parse amount
    let amount = 0;
    if (rawAmount !== undefined && rawAmount !== null) {
      const cleanAmount = rawAmount.toString().replace(/[$,]/g, "");
      amount = parseFloat(cleanAmount);
      if (isNaN(amount)) {
        errors.push(`Row ${rowNum}: Invalid Amount value: "${rawAmount}".`);
        return;
      }
    }

    // Validate subheader against static COA_SUB_HEADERS
    const subHeaderObj = COA_SUB_HEADERS.find(
      (sh) => sh.name.trim().toLowerCase() === subheaderName.toLowerCase()
    );
    if (!subHeaderObj) {
      errors.push(`Row ${rowNum}: Subheader "${subheaderName}" does not exist in the system.`);
      return;
    }

    const isChild = !!parentLeader && parentLeader.toLowerCase() !== name.toLowerCase();

    normalizedRows.push({
      rowNum,
      name,
      type,
      openingBalance: amount,
      subHeaderId: subHeaderObj.id,
      parentLeader: parentLeader || null,
      isChild,
    });
  });

  if (errors.length > 0) {
    throw new AppError(`Validation failed:\n${errors.join("\n")}`, 400);
  }

  return normalizedRows;
}

/**
 * 4. Process parent / independent accounts in bulk
 */
async function processParentAccounts(
  parentRows: NormalizedRow[],
  clientId: number,
  accountsMap: Map<string, any>,
  transaction: Transaction
): Promise<void> {
  const parentsToCreate: any[] = [];
  const seenInFile = new Set<string>();

  for (const row of parentRows) {
    const nameKey = row.name.trim().toLowerCase();
    
    if (accountsMap.has(nameKey)) {
      // Update existing parent account
      const existingAccount = accountsMap.get(nameKey);
      await existingAccount.update({
        type: row.type,
        openingBalance: row.openingBalance,
        subHeaderId: row.subHeaderId,
      }, { transaction });
    } else {
      // Prepare for bulk create if not already added in this run
      if (!seenInFile.has(nameKey)) {
        seenInFile.add(nameKey);
        parentsToCreate.push({
          name: row.name,
          type: row.type,
          openingBalance: row.openingBalance,
          subHeaderId: row.subHeaderId,
          parentId: null,
          clientId,
        });
      }
    }
  }

  if (parentsToCreate.length > 0) {
    const createdParents = await scoped(models.LedgerAccount).bulkCreate(parentsToCreate, {
      transaction,
      individualHooks: true
    });
    // Add newly created parents to map for pass 2
    createdParents.forEach((acc: any) => {
      accountsMap.set(acc.name.trim().toLowerCase(), acc);
    });
  }
}

/**
 * 5. Process child accounts and auto-resolve their parents in bulk
 */
async function processChildAccounts(
  childRows: NormalizedRow[],
  clientId: number,
  accountsMap: Map<string, any>,
  transaction: Transaction
): Promise<void> {
  // Pass 2a: Resolve missing parents listed as 'parentLeader'
  const missingParentsToCreate: any[] = [];
  const seenParentsInFile = new Set<string>();

  for (const row of childRows) {
    const parentName = row.parentLeader!;
    const parentKey = parentName.trim().toLowerCase();

    if (!accountsMap.has(parentKey) && !seenParentsInFile.has(parentKey)) {
      seenParentsInFile.add(parentKey);
      missingParentsToCreate.push({
        name: parentName,
        type: row.type, // inherit type from the child row
        openingBalance: 0,
        subHeaderId: row.subHeaderId, // inherit subheader from the child row
        parentId: null,
        clientId,
      });
    }
  }

  if (missingParentsToCreate.length > 0) {
    const createdNewParents = await scoped(models.LedgerAccount).bulkCreate(missingParentsToCreate, {
      transaction,
      individualHooks: true
    });
    createdNewParents.forEach((acc: any) => {
      accountsMap.set(acc.name.trim().toLowerCase(), acc);
    });
  }

  // Pass 2b: Create or update child accounts
  const childrenToCreate: any[] = [];
  const seenChildrenInFile = new Set<string>();

  for (const row of childRows) {
    const nameKey = row.name.trim().toLowerCase();
    const parentAccount = accountsMap.get(row.parentLeader!.trim().toLowerCase());
    const parentId = parentAccount ? (parentAccount as any).id : null;

    if (accountsMap.has(nameKey)) {
      // Update existing child account
      const existingChild = accountsMap.get(nameKey);
      await existingChild.update({
        type: row.type,
        openingBalance: row.openingBalance,
        subHeaderId: row.subHeaderId,
        parentId,
      }, { transaction });
    } else {
      // Prepare for bulk create if not already added in this run
      if (!seenChildrenInFile.has(nameKey)) {
        seenChildrenInFile.add(nameKey);
        childrenToCreate.push({
          name: row.name,
          type: row.type,
          openingBalance: row.openingBalance,
          subHeaderId: row.subHeaderId,
          parentId,
          clientId,
        });
      }
    }
  }

  if (childrenToCreate.length > 0) {
    await scoped(models.LedgerAccount).bulkCreate(childrenToCreate, {
      transaction,
      individualHooks: true
    });
  }
}

/**
 * Main bulk upload handler
 */
export const bulkUploadLedgerAccounts = async (fileBuffer: Buffer, userId: number, clientId: number) => {
  const data = parseExcelOrCsv(fileBuffer);
  validateHeaders(data);
  const normalizedRows = normalizeAndValidateRows(data);

  return await sequelize.transaction(async (transaction) => {
    // Retrieve all existing ledger accounts for this client using scoped findAll
    const existingAccounts = await scoped(models.LedgerAccount).findAll({
      transaction
    });

    const accountsMap = new Map<string, any>();
    existingAccounts.forEach((acc: any) => {
      if (acc.name) {
        accountsMap.set(acc.name.trim().toLowerCase(), acc);
      }
    });

    // Process parents first
    const parentRows = normalizedRows.filter(r => !r.isChild);
    await processParentAccounts(parentRows, clientId, accountsMap, transaction);

    // Process children (and create any missing parent accounts referenced by children)
    const childRows = normalizedRows.filter(r => r.isChild);
    await processChildAccounts(childRows, clientId, accountsMap, transaction);

    return { createdLedgersCount: normalizedRows.length };
  });
};
