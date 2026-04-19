import { Op, Transaction, Model } from "sequelize";
import {
  Client,
  Location,
  User,
  Account,
  Notes,
  FreightDetail,
  Product,
  RequestedPurchaseProduct,
  SIPL,
  SIPLProduct,
  Slab,
  Warehouse,
  Bill,
  InventoryProduct,
  LedgerAccount,
  JournalEntry,
  Customer,
  CustomerAddress,
  LoadingOrder,
  PackagingList,
  SalesOrder,
  SalesOrderProduct,
  ProductSubCategory,
  Payment,
  SlabRemeasurement,
  BillItem,
  Container,
  PaymentBill,
  SalesOrderInvoice,
  Truck,
  ProductGroup,
  ProductBaseColor,
  ProductFinish,
  AdvancedDeposit,
  AdvancedDepositSettlement,
  Return,
  ReturnProduct,
  Delivery,
  InvoiceDelivery,
  ServiceCategory,
  Service,
  TradeService,
  GenericProduct,
  CreditDebitNote,
  CartItem,
  SoProductSwapHistory,
  InventoryProductHold,
  SelectionSheet,
  SelectionSheetItem,
  VendorContact,
  WiringInstruction,
  TermsCondition,
  Vendor,
  PurchaseOrder,
  Bin,
} from "../models";
import { scoped } from "../utils/scoped";
import { sequelize } from "../config/database";

interface ClientCreateData {
  firstName: string;
  lastName: string;
  phone: string;
  accountId: number;
}

type ClientAttributes = {
  firstName: string;
  lastName: string;
  phone: string;
  accountId: number;
};

export async function findClientByEmail(email: string) {
  return await scoped(Client).findOne({ where: { email } });
}

export async function createClient(clientData: ClientAttributes, transaction?: Transaction) {
  return await scoped(Client).create(clientData as any, { transaction });
}

export const checkClientExists = async (clientId: number) => {
  return await Client.findByPk(clientId);
};

/**
 * Fetch all clients with pagination and optional search.
 */
export const getAllClients = async (page: number, limit: number, search?: string) => {
  const offset = (page - 1) * limit;

  // Define search condition if search query is provided
  const whereClause = search
    ? {
      [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { email: { [Op.like]: `%${search}%` } }],
    }
    : {};

  // Fetch clients along with the total count
  const { rows: clients, count: total } = await scoped(Client).findAndCountAll({
    where: whereClause,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return { clients, total, page, limit };
};

/**
 * Update client details by ID.
 */
export const updateClient = async (id: number, updateData: any) => {
  const [updatedRows] = await scoped(Client).update(updateData, { where: { id } });

  // If update was successful, return the updated client
  return updatedRows ? await Client.findByPk(id) : null;
};

/**
 * Get a client by ID
 */
export const getClientById = async (clientId: number, options?: any) => {
  return await Client.findByPk(clientId, {
    include: [
      {
        association: 'users',
        include: [
          {
            association: 'account',
            attributes: { exclude: ['password'] }
          }
        ]
      },
      {
        association: 'company'
      },
      {
        association: 'account',
        attributes: { exclude: ['password'] }

      }
    ],
    ...options
  });
};

/**
 * Get a client by ID
 */
export const getClientByIdSimple = async (clientId: number, options?: any) => {
  return await Client.findByPk(clientId, {
    include: [
      {
        association: 'company'
      },
      {
        association: 'account',
        attributes: { exclude: ['password'] }

      }
    ],
    ...options,
  });
};

/**
 * Get all locations associated with a client
 */
export const getClientLocations = async (clientId: number) => {
  let client: any = await Client.findByPk(clientId, {
    include: [{
      model: Location,
      as: "locations"
    }]
  });

  if (!client) {
    return null;
  }

  client = client.get({ plain: true })

  return client.locations;
};

/**
 * Update client's default location.
 */
export const updateClientDefaultLocation = async (clientId: number, locationId: number) => {
  return await scoped(Client).update({ defaultLocationId: locationId }, { where: { id: clientId } });
};

/**
 * Delete a client by ID.
 */
export const deleteClientById = async (clientId: number, transaction?: Transaction) => {
  const client = await Client.findByPk(clientId);
  if (!client) return false;
  await client.destroy({ transaction });
  return true;
};

/**
 * Deletes all data belonging to a client in dependency-safe order.
 */
export const deleteAllClientData = async (clientId: number, t: Transaction) => {
  const cachedIds = await cacheDeletionIds(clientId, t);
  
  await deleteStandardModels(clientId, t);
  await deleteComplexAssociations(cachedIds, t);
};

/**
 * 1. Cache IDs needed for complex cleanups before deleting parent records
 */
async function cacheDeletionIds(clientId: number, t: Transaction) {
  const [userAccountIds] = await Promise.all([
    User.findAll({ where: { clientId }, attributes: ['accountId'], transaction: t }).then(res => res.map((i: any) => i.accountId).filter(Boolean))
  ]);

  return { userAccountIds };
}

/**
 * 2. Standard Models: Simplified deletion by clientId in dependency order
 */
async function deleteStandardModels(clientId: number, t: Transaction) {
  const models = [
    // Leaves
    SlabRemeasurement, SoProductSwapHistory, InventoryProductHold, ReturnProduct,
    TradeService, SelectionSheetItem, PaymentBill, BillItem, CartItem,
    Notes, JournalEntry, CreditDebitNote, VendorContact, WiringInstruction,
    GenericProduct, FreightDetail, InvoiceDelivery, Container, AdvancedDepositSettlement,
    // Mid-level
    SelectionSheet, Return, SalesOrderProduct, AdvancedDeposit, Payment,
    SalesOrderInvoice, PackagingList,
    // Entities & Orders
    Delivery, LoadingOrder, SalesOrder, Slab, InventoryProduct,
    SIPLProduct, RequestedPurchaseProduct, SIPL, PurchaseOrder,
    Bill, CustomerAddress, Customer, Product, ProductSubCategory, ProductGroup,
    ProductBaseColor, ProductFinish, Vendor, Service, ServiceCategory,
    User, LedgerAccount, Bin, Warehouse, Location, TermsCondition, Truck
  ];

  for (const model of models) {
    await model.destroy({ 
      where: { clientId }, 
      transaction: t,
      force: true // Ensure paranoid (soft-delete) models are permanently removed
    });
  }
}

/**
 * 3. Custom Cleanup Tasks: For complex logic
 */
async function deleteComplexAssociations(ids: any, t: Transaction) {
  const { userAccountIds } = ids;

  // Cleanup User Accounts
  if (userAccountIds.length) {
    await Account.destroy({ 
      where: { id: userAccountIds }, 
      transaction: t,
      force: true 
    });
  }
}



export const doesClientHaveLocation = async (locationId: number, clientId: number) => {
  const location = await Location.findOne({
    where: { id: locationId, clientId: clientId }
  });

  return !!location;
};
