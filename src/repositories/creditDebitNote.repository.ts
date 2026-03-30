import { Transaction } from "sequelize";
import * as models from "../models";
import { scoped } from "../utils/scoped";

export const createCreditDebitNote = async (creditDebitNoteData: any, transaction?: Transaction) => {
    return await scoped(models.CreditDebitNote).create(creditDebitNoteData, { transaction });
};

export const getAllCreditDebitNotes = async (filters: any = {}, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;

    const { count, rows } = await scoped(models.CreditDebitNote).findAndCountAll({
        where: filters,
        include: [
            {
                model: models.Client,
                as: "client",
                attributes: ["id", "firstName", "lastName"],
            },
        ],
        order: [["createdAt", "DESC"]],
        limit,
        offset,
    });

    return { total: count, creditDebitNotes: rows, page, limit };
};

export const getCreditDebitNoteById = async (id: number) => {
    return await models.CreditDebitNote.findByPk(id, {
        include: [
            {
                model: models.Client,
                as: "client",
                attributes: ["id", "firstName", "lastName"],
            },
        ],
    });
};

export const updateCreditDebitNote = async (id: number, updateData: any, transaction?: Transaction) => {
    const [affectedRows] = await scoped(models.CreditDebitNote).update(updateData, {
        where: { id },
        transaction,
    });

    if (affectedRows === 0) {
        return null;
    }

    return await getCreditDebitNoteById(id);
};

export const getCreditDebitNoteByReference = async (referenceId: number, referenceType: string) => {
    return await scoped(models.CreditDebitNote).findOne({
        where: { referenceId, referenceType }
    });
};
