import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES } from "../constants/coa";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";

export const createLedgerAccount = async (data: any) => {
  return await ledgerAccountRepository.createLedgerAccount(data);
};

export const getLedgerAccounts = async (page = 1, limit = 10, filters: any) => {
  let data: any = await ledgerAccountRepository.getLedgerAccounts(page, limit, filters);

  data.rows = data.rows.map((e: any) => {
    e = e.get({ plain: true });

    e.subHeader = COA_SUB_HEADERS.find((k) => k.id == e.subHeaderId);
    e.header = COA_HEADERS.find((k) => k.id == e.subHeader.parent_id);
    e.type = COA_TYPES.find((k) => k.id == e.header.parent_id);

    return e;
  });

  return data;
};

export const getLedgerAccountById = async (id: number) => {
  return await ledgerAccountRepository.getLedgerAccountById(id);
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
