import * as siplProductsRepository from "../repositories/siplProducts.repository";

// Delete requested purchase product
export const deleteRequestedPurchaseProduct = async (id: number) => {
  const product = await siplProductsRepository.findById(id);

  if (!product) {
    throw new Error("SIPL product not found");
  }

  const data = await siplProductsRepository.deleteProductById(id);

  return data;
};
