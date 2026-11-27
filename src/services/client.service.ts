import { Transaction } from "sequelize";
import { sequelize } from "../config/database";
import {
  COA_HEADERS,
  COA_SUB_HEADERS,
  DEFAULT_LEDGER_ACCOUNT_KEYS,
  FREIGHT_BILL_ACCOUNT_KEYS,
  LEDGER_ACCOUNT_TYPES,
} from "../constants/coa";
import { AppError } from "../helper/appError";
import { requestContext } from "../utils/requestContext";

import { PERMISSIONS } from "../constants/permissions";
import * as accountRepository from "../repositories/account.repository";
import * as accountPermissionRepository from "../repositories/accountPermission.repository";
import * as clientRepository from "../repositories/client.repository";
import * as companyRepository from "../repositories/company.repository";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as locationRepository from "../repositories/location.repository";
import * as serviceRepository from "../repositories/service.repository";
import * as serviceCategoryRepository from "../repositories/serviceCategory.repository";
import * as warehouseRepository from "../repositories/warehouse.repository";
import * as userRepository from "../repositories/user.repository";
import * as accountService from "./account.service";

type ClientRegistrationData = {
  primary: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    userCount: number;
  };
  location: {
    locationName: string;
    locationCode: string;
    contactName: string;
    contactNumber: string;
    contactMail: string;
    address: string;
    addressLine?: string;
    lat: number;
    long: number;
  };
  company: {
    companyName: string;
    companyAddress: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    contactPersonName: string;
    contactMobile: string;
    email: string;
  };
  ledgerAccounts?: Array<{
    key: string;
    name?: string;
    openingBalance?: number;
    openingDate?: Date | string;
  }>;
};

/**
 * Register Client
 */
export const registerClient = async (clientData: ClientRegistrationData) => {
  // Start a transaction
  const transaction = await sequelize.transaction();

  try {
    // Extract account data and company/location data
    const { primary, location, company } = clientData;
    const { email, password, ...clientDetails } = primary;

    if (!(email && password)) {
      throw new AppError("Email and password are required", 400);
    }

    // Create account (account service handles its own transaction)
    const account = await accountService.createAccount({ email, password }, transaction);

    // Create client with account reference within transaction
    const client = await clientRepository.createClient({
      ...clientDetails,
      accountId: account.getDataValue('id')
    }, transaction);

    return await requestContext.run({ clientId: client.getDataValue('id') }, async () => {
      // Assign all permissions to the client account
      const allPermissionValues = Object.values(PERMISSIONS).map(p => p.value);

      const permissionsToAssign = allPermissionValues.map(permission => ({
        accountId: account.getDataValue('id'),
        permission
      }));

      await accountPermissionRepository.createAccountPermissions(permissionsToAssign, transaction);

      // Create company
      await companyRepository.createCompany({
        ...company,
        clientId: client.getDataValue('id')
      }, transaction);

      // Create location
      const createdLocation = await locationRepository.createLocation({
        ...location,
        clientId: client.getDataValue('id')
      }, transaction);

      // Set locationId in context for subsequent operations (like warehouse creation)
      const store = requestContext.getStore();
      if (store) {
        store.locationId = createdLocation.getDataValue('id');
      }

      // Create default warehouse for this location
      await warehouseRepository.createWarehouse({
        locationId: createdLocation.getDataValue('id'),
        clientId: client.getDataValue('id')
      }, transaction);

      // Update client defaultLocationId
      await client.update({ defaultLocationId: createdLocation.getDataValue('id') }, { transaction });

      // Create primary admin User for the company
      const primaryUser: any = await userRepository.createUser(
        {
          username: `${clientDetails.firstName} ${clientDetails.lastName}`,
          userid: clientDetails.phone || `admin_${client.getDataValue("id")}`,
          phone: clientDetails.phone,
          clientId: client.getDataValue("id"),
          companyId: client.getDataValue("id"),
          accountId: account.getDataValue("id"),
          defaultLocationId: createdLocation.getDataValue("id"),
          roleId: 1, // System Company Admin Role
          locationScope: "company",
          role: "admin",
        } as any,
        transaction
      );

      // Assign location to primary user
      if (primaryUser?.id) {
        await userRepository.addUserLocation(primaryUser.id, createdLocation.getDataValue('id'));
      }

      // Create default ledger accounts for the client within transaction
      const createdLedgerAccounts = await createDefaultLedgerAccountsForClient(
        client.getDataValue('id'),
        clientData.ledgerAccounts,
        transaction
      );

      // Create default service categories and services (including Delivery Services linked to Delivery Charges Revenue)
      await createDefaultServicesForClient(client.getDataValue('id'), createdLedgerAccounts, transaction);

      // If everything is successful, commit the transaction
      await transaction.commit();

      // Fetch the complete client data with company and locations
      const completeClient = await clientRepository.getClientById(client.getDataValue('id'), {
        include: ['company', 'locations']
      });

      return completeClient;
    });
  } catch (error) {
    // If any error occurs, rollback the transaction
    await transaction.rollback();
    throw error;
  }
};

/**
 * Service to fetch all clients with pagination and optional search.
 */
export const fetchAllClients = async (page: number, limit: number, search?: string) => {
  return clientRepository.getAllClients(page, limit, search);
};

/**
 * Service to update a client by ID.
 */
export const modifyClient = async (id: number, updateData: any) => {
  const updatedClient = await clientRepository.updateClient(id, updateData);
  if (!updatedClient) throw new AppError("User not found or update failed", 400);
  return updatedClient;
};

export const getClientById = async (id: number) => {
  const client = await clientRepository.getClientById(id);
  if (!client) throw new AppError("Client not found", 404);
  return client;
};

export const getDefaultLedgerAccountsTemplate = () => {
  const definitions = [
    {
      name: "Freight-In",
      key: FREIGHT_BILL_ACCOUNT_KEYS.FREIGHT_IN,
      subHeaderKey: "freight_expense",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Brokerage Charges",
      key: FREIGHT_BILL_ACCOUNT_KEYS.BROKERAGE_CHARGES,
      subHeaderKey: "customs_fees_and_duty",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Inventory In Transit",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_IN_TRANSIT,
      subHeaderKey: "in_transit",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Finished Goods",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
      subHeaderKey: "merchandise",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Cash Bank",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.CASH_BANK,
      subHeaderKey: "cash_and_cash_equivalents",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "COGS",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS,
      subHeaderKey: "cost_of_goods_and_services_sold",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Goods Sold",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD,
      subHeaderKey: "goods",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "State Tax",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.STATE_TAX,
      subHeaderKey: "tax_payables",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "County Tax",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.COUNTY_TAX,
      subHeaderKey: "tax_payables",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "Default Service Account",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.DEFAULT_SERVICE_ACCOUNT,
      subHeaderKey: "services_5_1",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Account Receivable",
      key: "account_receivable",
      subHeaderKey: "accounts_notes_loans_receivable",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Account Payables",
      key: "account_payables",
      subHeaderKey: "trade_payables",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "Sales Discounts",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.SALES_DISCOUNTS,
      subHeaderKey: "variable_consideration",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Sales Returns & Allowances",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.SALES_RETURNS_AND_ALLOWANCES,
      subHeaderKey: "variable_consideration",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Customer Advances",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.CUSTOMER_ADVANCES,
      subHeaderKey: "deferred_income_refund_liabilities",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "Customer Refund Payable",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.CUSTOMER_REFUND_PAYABLE,
      subHeaderKey: "deferred_income_refund_liabilities",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "Delivery Charges Revenue",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.DELIVERY_CHARGES_REVENUE,
      subHeaderKey: "services_4_1",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "Bad Debt Expense",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.BAD_DEBT_EXPENSE,
      subHeaderKey: "uncollectible_accounts_expense_reversal",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Goods Received Not Invoiced (GRNI)",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_RECEIVED_NOT_INVOICED,
      subHeaderKey: "other_accounts_payable_accrued_liabilities",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "Accounts Payable Write-off Income",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.ACCOUNTS_PAYABLE_WRITE_OFF_INCOME,
      subHeaderKey: "other_revenue",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "Inventory Adjustment Gain",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_ADJUSTMENT_GAIN,
      subHeaderKey: "inventory_gain_and_loss",
      type: LEDGER_ACCOUNT_TYPES.CREDIT,
    },
    {
      name: "Inventory Adjustment Loss",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.INVENTORY_ADJUSTMENT_LOSS,
      subHeaderKey: "inventory_gain_and_loss",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Landed Cost Clearing",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.LANDED_COST_CLEARING,
      subHeaderKey: "additional_assets",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Outward Freight Expense",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.OUTWARD_FREIGHT_EXPENSE,
      subHeaderKey: "selling_general_administrative_expense",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
    {
      name: "Payment Clearing",
      key: DEFAULT_LEDGER_ACCOUNT_KEYS.PAYMENT_CLEARING,
      subHeaderKey: "cash_and_cash_equivalents",
      type: LEDGER_ACCOUNT_TYPES.DEBIT,
    },
  ];

  return definitions.map((item) => {
    const subHeader = COA_SUB_HEADERS.find((e) => e.key === item.subHeaderKey);
    const header = subHeader ? COA_HEADERS.find((h) => h.id === Number(subHeader.parent_id)) : null;
    return {
      key: item.key,
      name: item.name,
      subHeaderId: subHeader?.id,
      subHeaderName: subHeader?.name || "",
      headerName: header?.name || "",
      type: item.type,
      defaultOpeningBalance: 0,
    };
  });
};

const createDefaultLedgerAccountsForClient = async (
  clientId: number,
  clientAccounts: Array<{ key: string; name?: string; openingBalance?: number; openingDate?: Date | string }> = [],
  transaction: Transaction
) => {
  const accountOpeningMap = new Map<string, { openingBalance?: number; openingDate?: Date | string; name?: string }>();
  if (Array.isArray(clientAccounts)) {
    for (const acc of clientAccounts) {
      if (acc && acc.key) {
        accountOpeningMap.set(acc.key, acc);
      }
    }
  }

  const template = getDefaultLedgerAccountsTemplate();
  const createdAccounts: any[] = [];

  for (const item of template) {
    const custom = accountOpeningMap.get(item.key);
    const openingBalance =
      custom?.openingBalance !== undefined && custom?.openingBalance !== null
        ? Number(custom.openingBalance)
        : 0;
    const openingDate = custom?.openingDate ? new Date(custom.openingDate) : new Date();
    const name = custom?.name && custom.name.trim() ? custom.name.trim() : item.name;

    const accountData = {
      name,
      clientId,
      key: item.key,
      subHeaderId: item.subHeaderId!,
      type: item.type,
      openingBalance: isNaN(openingBalance) ? 0 : openingBalance,
      openingDate: isNaN(openingDate.getTime()) ? new Date() : openingDate,
    };

    const createdAccount = await ledgerAccountRepository.createLedgerAccount(accountData, transaction);
    createdAccounts.push(createdAccount);
  }

  return createdAccounts;
};

const createDefaultServicesForClient = async (
  clientId: number,
  createdLedgerAccounts: any[],
  transaction: Transaction
) => {
  const findLedgerIdByKey = (key: string) => {
    const acc = createdLedgerAccounts.find(
      (a: any) => (a.get ? a.get("key") : a.key) === key
    );
    return acc ? (acc.get ? acc.get("id") : acc.id) : null;
  };

  const deliveryChargesRevenueId = findLedgerIdByKey(
    DEFAULT_LEDGER_ACCOUNT_KEYS.DELIVERY_CHARGES_REVENUE
  );
  const freightInId = findLedgerIdByKey(FREIGHT_BILL_ACCOUNT_KEYS.FREIGHT_IN);
  const defaultServiceAccountId = findLedgerIdByKey(
    DEFAULT_LEDGER_ACCOUNT_KEYS.DEFAULT_SERVICE_ACCOUNT
  );

  if (!deliveryChargesRevenueId) return;

  const deliveryCategory: any = await serviceCategoryRepository.createServiceCategory(
    {
      name: "Delivery Services",
      type: "sale",
      clientId,
    },
    transaction
  );

  const deliveryCategoryId = deliveryCategory.get
    ? deliveryCategory.get("id")
    : deliveryCategory.id;

  const defaultDeliveryServices = [
    {
      name: "Home Delivery",
      uomId: 14,
      basePrice: 100.0,
      ledgerAccountId: deliveryChargesRevenueId,
      description: "Home delivery service for customer orders",
      serviceCategoryId: deliveryCategoryId,
      clientId,
    },
    {
      name: "Express Delivery",
      uomId: 14,
      basePrice: 200.0,
      ledgerAccountId: deliveryChargesRevenueId,
      description: "Express delivery service with same-day or next-day delivery",
      serviceCategoryId: deliveryCategoryId,
      clientId,
    },
  ];

  for (const serviceData of defaultDeliveryServices) {
    await serviceRepository.createService(serviceData, transaction);
  }

  if (freightInId) {
    const freightCategory: any = await serviceCategoryRepository.createServiceCategory(
      {
        name: "Freight Services",
        type: "purchase",
        clientId,
      },
      transaction
    );
    const freightCategoryId = freightCategory.get
      ? freightCategory.get("id")
      : freightCategory.id;

    await serviceRepository.createService(
      {
        name: "Local Freight",
        uomId: 14,
        basePrice: 150.0,
        ledgerAccountId: freightInId,
        description: "Local freight service for transportation within city limits",
        serviceCategoryId: freightCategoryId,
        clientId,
      },
      transaction
    );
  }

  if (defaultServiceAccountId) {
    const installationCategory: any = await serviceCategoryRepository.createServiceCategory(
      {
        name: "Installation Services",
        type: "sale",
        clientId,
      },
      transaction
    );
    const installationCategoryId = installationCategory.get
      ? installationCategory.get("id")
      : installationCategory.id;

    await serviceRepository.createService(
      {
        name: "Standard Installation",
        uomId: 1,
        basePrice: 25.0,
        ledgerAccountId: defaultServiceAccountId,
        description: "Standard installation service per square foot",
        serviceCategoryId: installationCategoryId,
        clientId,
      },
      transaction
    );
  }
};

/**
 * Service to fetch a client's profile by ID.
 */
export const getClientProfile = async (clientId: number) => {
  const client = (await clientRepository.getClientById(clientId))?.get({ plain: true });
  if (!client) throw new AppError("Client not found", 404);
  return { ...client, userType: 'client' };
};

/**
 * Service to fetch a client's profile by ID.
 */
export const getClientProfileSimple = async (clientId: number) => {
  const client = (await clientRepository.getClientByIdSimple(clientId)).get({ plain: true });
  if (!client) throw new AppError("Client not found", 404);
  return { ...client, userType: 'client' };
};

export const getClientQrCode = async (clientId: number) => {
  const client: any = await clientRepository.getClientByIdSimple(clientId);
  if (!client) throw new AppError("Client not found", 404);
  return {
    clientId: client.id,
    qrCode: client.qrCode,
    firstName: client.firstName,
    lastName: client.lastName,
    companyName: client.company?.companyName || "",
  };
};

// Get client locations
export const getClientLocations = async (clientId: number) => {
  const client = await clientRepository.getClientById(clientId);
  if (!client) {
    throw new AppError("Client not found", 404);
  }

  // Get all locations associated with the client
  const locations = await clientRepository.getClientLocations(clientId);
  return locations;
};

/**
 * Assigns a default location to a client after validation.
 */
export const assignDefaultLocation = async (clientId: number, locationId: number) => {
  // Check if client exists
  const client = await clientRepository.checkClientExists(clientId);
  if (!client) {
    throw new AppError("Client not found", 404);
  }

  const clientHaveLocation = await clientRepository.doesClientHaveLocation(locationId, clientId);

  if (!clientHaveLocation) {
    throw new AppError("Client does not have access to this location", 400);
  }

  // Update default location
  const [updated] = await clientRepository.updateClientDefaultLocation(clientId, locationId);

  if (!updated) {
    throw new AppError("Failed to update default location", 400);
  }

  return updated;
};

/**
 * Permanently deletes a client's account.
 * Reuses accountService.authenticateAccount (same as login) to verify credentials,
 * avoiding duplication of bcrypt + account-lookup logic.
 */
export const deleteClientAccount = async (email: string, password: string) => {
  // Authenticate using the same method as login — handles email lookup + bcrypt verify
  const authResult = await accountService.authenticateAccount(email, password);
  if (!authResult) {
    throw new AppError("Invalid email or password", 404);
  }

  const { user } = authResult;

  // Only client accounts may request self-deletion via this endpoint
  if (user.accountType !== "client") {
    throw new AppError("This endpoint is only available for client accounts", 403);
  }

  const { clientId, accountId } = user;

  const transaction = await sequelize.transaction();
  try {
    // Wipe all tables that reference this client (leaf-first order)
    await clientRepository.deleteAllClientData(clientId, transaction);
    // Delete the Client row, then the Account
    await clientRepository.deleteClientById(clientId, transaction);
    await accountRepository.deleteAccount(accountId, transaction);
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};





export const getCompanyProfileData = async (clientId: number) => {
  const company = await clientRepository.getCompanyByClientId(clientId);
  if (!company) throw new AppError("Company not found", 404);
  const client: any = await clientRepository.getClientById(clientId);
  return { ...company.get({ plain: true }), s3FileId: client?.s3FileId };
};

export const updateCompanyProfileData = async (clientId: number, updateData: any) => {
  const transaction = await sequelize.transaction();
  try {
    const { s3FileId, ...companyData } = updateData;

    let updatedCompany = await clientRepository.updateCompanyProfile(clientId, companyData, transaction);

    if (s3FileId !== undefined) {
      await clientRepository.updateClient(clientId, { s3FileId }, transaction);
    }

    await transaction.commit();

    if (!updatedCompany) throw new AppError("Company not found or update failed", 400);

    return updatedCompany;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
