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

  const { count, rows } = await Notes.findAndCountAll({
    where: { ...(filters ? filters : {}) },
    offset,
    limit,
    order: [["createdAt", "DESC"]],
  });

  return { total: count, notes: rows };
};
