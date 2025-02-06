import poSlabDetailModel from "../models/poSlabDetailModel.js"

export const updateSlabStatus = async (id, status) => {
    try {
        await poSlabDetailModel.update({ status }, {
            where: {
                poSlabDetailId: id
            }
        })
    } catch (error) {
        throw Error("Error while updating slab status.")
    }
}