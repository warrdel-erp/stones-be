import { sequelize } from "../config/database";
import * as salesOrderRepository from "../repositories/salesOrder.repository";
import * as notesRepository from "../repositories/notes.repository";

export const createSalesOrder = async (data: any) => {
  const transaction = await sequelize.transaction();
  try {
    const salesOrder: any = await salesOrderRepository.createSalesOrder(data, transaction);

    // Create internal note (if provided)
    let internalNote: any = null;
    if (data?.internalNote) {
      internalNote = await notesRepository.createNote(
        {
          description: data?.internalNote,
          type: "internal",
          referenceType: "sales_order",
          referenceId: salesOrder?.id,
        },
        transaction
      );
    }

    // Create printable note (if provided)
    let printableNote: any = null;
    if (data?.printableNote) {
      printableNote = await notesRepository.createNote(
        {
          description: data?.printableNote,
          type: "printable",
          referenceType: "sales_order",
          referenceId: salesOrder?.id, // Temporarily null, updated after PO creation
        },
        transaction
      );
    }

    await transaction.commit();
    return salesOrder;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAllSalesOrders = async () => {
  return await salesOrderRepository.getAllSalesOrders();
};

export const getSalesOrderById = async (id: number) => {
  return await salesOrderRepository.getSalesOrderById(id);
};
