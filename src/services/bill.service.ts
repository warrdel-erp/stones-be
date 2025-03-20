import { sequelize } from "../config/database";
import * as billRepository from "../repositories/bill.repository";
import * as billItemRepository from "../repositories/billItems.repository";
import * as journalEntryService from "./journalEntry.service";

export const createBill = async (billData: any) => {
  if (!billData.items || !Array.isArray(billData.items)) {
    throw new Error("Bill items are required.");
  }

  const transaction = await sequelize.transaction();

  const billItems: any[] = [];

  try {
    const bill: any = await billRepository.createBill(billData, transaction);

    for (const item of billData.items) {
      const billItem = await billItemRepository.createBillItem(
        {
          ...item,
          billId: bill.id,
        },
        transaction
      );

      // Create journal entry for freight bill item.
      await journalEntryService.createJournalEntryForFreightBillItem(item, billData, transaction);

      billItems.push(billItem);
    }

    await transaction.commit();
    return { bill, billItems };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// get one bill by id
export const getOneBill = async (id: number) => {
  const bill = await billRepository.getOneBill(id);
  if (!bill) {
    throw new Error("Bill not found");
  }
  return bill;
};

// get all bills with pagination and filters
export const getAllBills = async (page: number, limit: number, filters?: { [key: string]: any }) => {
  let { count, rows } = await billRepository.getAllBills(page, limit, filters);

  rows = rows.map((bill: any) => {
    bill = bill.get({ plain: true });
    bill.total = bill.billItems.reduce((total: number, billItem: any) => total + Number(billItem.amount), 0);

    return {
      ...bill,
    };
  }) as any;

  return {
    total: count,
    page,
    limit,
    data: rows,
  };
};

// Get new bill number
export const getBillNumber = async (clientId: number) => {
  return await billRepository.getBillNumber(clientId);
};

export async function billForVendor(vendorId: number) {
  let bills = await billRepository.getAllBillsForVendor({ vendorId });

  bills = bills.map((bill: any) => {
    bill = bill.get({ plain: true });
    bill.total = bill.billItems.reduce((total: number, billItem: any) => total + Number(billItem.amount), 0);

    return {
      ...bill,
    };
  }) as any;
  return bills;
}
