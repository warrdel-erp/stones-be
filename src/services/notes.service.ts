import * as notesRepository from "../repositories/notes.repository";

export const fetchNotes = async (filters: any, page: number, limit: number) => {
  return await notesRepository.getNotes(filters, page, limit);
};
