import * as inventoryRepository from '../repository/inventory.repository.js'

export async function inventoryBalance(productId) {
   
    return await inventoryRepository.slabsCount(productId)
}
