import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES } from "../constants/coa";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as journalEntriesRepository from "../repositories/journalEntry.repository";

export const createLedgerAccount = async (data: any) => {
  return await ledgerAccountRepository.createLedgerAccount(data);
};

export const getLedgerAccounts = async (page = 1, limit = 10, clientId: number, filters: any) => {
  let data: any = await ledgerAccountRepository.getLedgerAccounts(page, limit, clientId, filters);

  data.rows = await Promise.all(data.rows.map(async (e: any) => {
    e = e.get({ plain: true });

    e.subHeader = COA_SUB_HEADERS.find((k) => k.id == e.subHeaderId);
    e.header = COA_HEADERS.find((k) => k.id == e.subHeader.parent_id);
    e.parentType = COA_TYPES.find((k) => k.id == e.header.parent_id);

    const finalJournalAmount = await journalEntriesRepository.getFinalAmountForLedger(e.id);

    return { ...e, finalAmount: Number(e.openingBalance) + finalJournalAmount };
  }));

  return data;
};

export const getLedgerAccountsWithoutPagination = async (filters: any) => {
  let data: any = await ledgerAccountRepository.getLedgerAccountsWithoutPagination(filters);

  data = data.map((e: any) => {
    e = e.get({ plain: true });

    e.subHeader = COA_SUB_HEADERS.find((k) => k.id == e.subHeaderId);
    e.header = COA_HEADERS.find((k) => k.id == e.subHeader.parent_id);
    e.type = COA_TYPES.find((k) => k.id == e.header.parent_id);

    return e;
  });

  return data;
};

export const getLedgerAccountById = async (id: number) => {
  let data: any = await ledgerAccountRepository.getLedgerAccountById(id);

  data = data.get({ plain: true });

  // populate parent data.
  data.subHeader = COA_SUB_HEADERS.find((k) => k.id == data.subHeaderId);
  data.header = COA_HEADERS.find((k) => k.id == data.subHeader.parent_id);
  data.parentType = COA_TYPES.find((k) => k.id == data.header.parent_id);

  return data
};

export const getLedgerAccountsForFreightItems = async (clientId: number) => {
  return await ledgerAccountRepository.getLedgerAccountsForFreightItems(clientId);
};

// export const updateLedgerAccount = async (id: number, data: any) => {
//   return ledgerAccountRepository.updateLedgerAccount(id, data);
// };

// export const deleteLedgerAccount = async (id: number) => {
//   return ledgerAccountRepository.deleteLedgerAccount(id);
// };
