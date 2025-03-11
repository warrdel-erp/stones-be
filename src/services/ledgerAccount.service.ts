import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";

export const createLedgerAccount = async (data: any) => {
  return ledgerAccountRepository.createLedgerAccount(data);
};

export const getLedgerAccounts = async (page = 1, limit = 10, filters: any) => {
  return ledgerAccountRepository.getLedgerAccounts(page, limit, filters);
};

export const getLedgerAccountById = async (id: number) => {
  return ledgerAccountRepository.getLedgerAccountById(id);
};

export const getLedgerAccountsForFreightItems = async (clientId: number) => {
  return ledgerAccountRepository.getLedgerAccountsForFreightItems(clientId);
};

// export const updateLedgerAccount = async (id: number, data: any) => {
//   return ledgerAccountRepository.updateLedgerAccount(id, data);
// };

// export const deleteLedgerAccount = async (id: number) => {
//   return ledgerAccountRepository.deleteLedgerAccount(id);
// };
