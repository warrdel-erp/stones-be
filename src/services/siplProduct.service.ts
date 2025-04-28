import * as siplProductsRepository from "../repositories/siplProducts.repository";

// Delete requested purchase product
export const deleteRequestedPurchaseProduct = async (id: number) => {
  const product = await siplProductsRepository.findOne({ id });

  if (!product) {
    throw new Error("SIPL product not found");
  }

  const data = await siplProductsRepository.deleteProductById(id);

  return data;
};

// Find Sipl Product By Product Id
export const findSiplProductByProductId = async (siplProductId: number, productId: number, siplId: number) => {
  return await siplProductsRepository.findByProductIdAndSiplId(siplProductId, productId, siplId);
};

export const fetchTotalSIPLProductAmount = async (
  fromDate: string,
  toDate: string,
  clientId: number,
) => {
  return await siplProductsRepository.getTotalSIPLProductAmountBetweenDates(fromDate, toDate, clientId);
};

export const getTotalSIPLProductValueByClient = async (clientId: number) => {
  return await siplProductsRepository.getTotalSIPLProductValueByClient(clientId);
}
