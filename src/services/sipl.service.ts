import { sequelize } from "../config/database";
import * as poRepository from "../repositories/purchaseOrder.repository";
import * as siplRepository from "../repositories/sipl.repository";
import * as slabRepository from "../repositories/slab.repository";

/**
 * Processes the inventory reception by updating slab statuses.
 * @param siplId - The SIPL ID.
 */
export const receiveInventory = async (siplId: number): Promise<number> => {
  return await slabRepository.updateSlabStatusBySipl(siplId);
};

export async function createSIPLService(siplData: any) {
  const transaction = await sequelize.transaction();
  try {
    // Create SIPL
    let sipl: any = await siplRepository.createSIPL({ ...siplData }, transaction);

    // Create SIPL Products (if provided)
    if (siplData.products?.length) {
      await siplRepository.createSIPLProducts(siplData.products, sipl.id, transaction);
    }

    // Create Freight Detail (if provided)
    if (siplData.freightDetail) {
      await poRepository.createFreightDetail(siplData.freightDetail, { siplId: sipl.id }, transaction);
    }

    await transaction.commit();
    return sipl;
  } catch (error: any) {
    transaction.rollback();
    throw error;
  }
}

// Create slabs for SIPL
export async function handleCreateSlabs(slabData: any) {
  const transaction = await sequelize.transaction();
  try {
    const newSlabs = await slabRepository.createSlabs(slabData, transaction);
    await transaction.commit();
    return newSlabs;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
