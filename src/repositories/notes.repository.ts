import { Transaction } from "sequelize";
import Notes from "../models/note";

/**
 * Create a note entry in the database.
 */
export const createNote = async (noteData: any, transaction?: Transaction) => {
  return await Notes.create(noteData, { transaction });
};
