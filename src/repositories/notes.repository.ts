import { Transaction } from "sequelize";
import Notes from "../models/note.model";
import { scoped } from "../utils/scoped";

/**
 * Create a note entry in the database.
 */
export const createNote = async (noteData: any, transaction?: Transaction) => {
  return await scoped(Notes).create(noteData, { transaction });
};

export const getNotes = async (filters: any, page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const { count, rows } = await scoped(Notes).findAndCountAll({
    where: { ...(filters ? filters : {}) },
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });

  return { total: count, notes: rows };
};

export const findNoteByReference = async (referenceId: number, referenceType: string, type: string, transaction?: Transaction) => {
  return await scoped(Notes).findOne({ where: { referenceId, referenceType, type }, transaction });
};

export const updateNote = async (id: number, data: any, transaction?: Transaction) => {
  return await scoped(Notes).update(data, { where: { id }, transaction });
};

export const deleteNote = async (id: number, transaction?: Transaction) => {
  return await scoped(Notes).destroy({ where: { id }, transaction });
};
