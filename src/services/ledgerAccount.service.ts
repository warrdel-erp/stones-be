import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES, DEFAULT_LEDGER_ACCOUNT_KEYS } from "../constants/coa";
import * as ledgerAccountRepository from "../repositories/ledgerAccount.repository";
import * as journalEntriesRepository from "../repositories/journalEntry.repository";

export const createLedgerAccount = async (data: any) => {
  return await ledgerAccountRepository.createLedgerAccount(data);
};

const getBalanceForLedgerGeneral = async (ledgerId: number): Promise<number> => {
  const children = await ledgerAccountRepository.getLedgerAccountsWithoutPagination({ parentId: ledgerId });
  if (children && children.length > 0) {
    let total = 0;
    for (const child of children) {
      const childPlain = child.get({ plain: true });
      const finalJournalAmount = await journalEntriesRepository.getFinalAmountForLedger(childPlain.id);
      total += Number(childPlain.openingBalance) + finalJournalAmount;
    }
    return total;
  }

  const ledger = await ledgerAccountRepository.getLedgerAccountById(ledgerId);
  if (!ledger) return 0;
  const ledgerPlain = ledger.get({ plain: true });
  const finalJournalAmount = await journalEntriesRepository.getFinalAmountForLedger(ledgerId);
  return Number(ledgerPlain.openingBalance) + finalJournalAmount;
};

export const getLedgerAccounts = async (page = 1, limit = 10, clientId: number, filters: any) => {
  let data: any = await ledgerAccountRepository.getLedgerAccounts(page, limit, clientId, filters);

  data.rows = await Promise.all(data.rows.map(async (e: any) => {
    e = e.get({ plain: true });

    e.subHeader = COA_SUB_HEADERS.find((k) => k.id == e.subHeaderId);
    e.header = COA_HEADERS.find((k) => k.id == e.subHeader.parent_id);
    e.parentType = COA_TYPES.find((k) => k.id == e.header.parent_id);

    const children = await ledgerAccountRepository.getLedgerAccountsWithoutPagination({ parentId: e.id });
    const isParent = children && children.length > 0;

    const finalAmount = await getBalanceForLedgerGeneral(e.id);

    return { ...e, finalAmount, isParent };
  }));

  return data;
};

export const getLedgerAccountsWithoutPagination = async (filters: any) => {
  let data: any = await ledgerAccountRepository.getLedgerAccountsWithoutPagination(filters);

  data = await Promise.all(data.map(async (e: any) => {
    e = e.get({ plain: true });

    e.subHeader = COA_SUB_HEADERS.find((k) => k.id == e.subHeaderId);
    e.header = COA_HEADERS.find((k) => k.id == e.subHeader.parent_id);
    e.type = COA_TYPES.find((k) => k.id == e.header.parent_id);

    const children = await ledgerAccountRepository.getLedgerAccountsWithoutPagination({ parentId: e.id });
    const isParent = children && children.length > 0;

    const finalAmount = await getBalanceForLedgerGeneral(e.id);
    e.finalAmount = finalAmount;
    e.isParent = isParent;

    return e;
  }));

  return data;
};

export const getLedgerAccountById = async (id: number) => {
  let data: any = await ledgerAccountRepository.getLedgerAccountById(id);

  data = data.get({ plain: true });

  // populate parent data.
  data.subHeader = COA_SUB_HEADERS.find((k) => k.id == data.subHeaderId);
  data.header = COA_HEADERS.find((k) => k.id == data.subHeader.parent_id);
  data.parentType = COA_TYPES.find((k) => k.id == data.header.parent_id);

  data.finalAmount = await getBalanceForLedgerGeneral(id);

  // Fetch children
  const childAccounts = await ledgerAccountRepository.getLedgerAccountsWithoutPagination({ parentId: id });
  data.children = await Promise.all(childAccounts.map(async (child: any) => {
    const childPlain = child.get({ plain: true });
    const finalJournalAmount = await journalEntriesRepository.getFinalAmountForLedger(childPlain.id);
    childPlain.finalAmount = Number(childPlain.openingBalance) + finalJournalAmount;

    childPlain.subHeader = COA_SUB_HEADERS.find((k) => k.id == childPlain.subHeaderId);
    childPlain.header = COA_HEADERS.find((k) => k.id == childPlain.subHeader.parent_id);
    childPlain.parentType = COA_TYPES.find((k) => k.id == childPlain.header.parent_id);
    return childPlain;
  }));

  return data;
};

export const getLedgerAccountsForFreightItems = async (clientId: number) => {
  return await ledgerAccountRepository.getLedgerAccountsForFreightItems(clientId);
};

export const getDefaultLedgerAccountsForProduct = async (clientId: number) => {
  const finishedGoodsAccount = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.FINISHED_GOODS,
    clientId,
  });

  const cogsAccount = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.COGS,
    clientId,
  });

  const goodsSoldAccount = await ledgerAccountRepository.getLedgerAccountByFilter({
    key: DEFAULT_LEDGER_ACCOUNT_KEYS.GOODS_SOLD,
    clientId,
  });

  return {
    finishedGoodsAccount,
    cogsAccount,
    goodsSoldAccount
  };
};

// export const updateLedgerAccount = async (id: number, data: any) => {
//   return ledgerAccountRepository.updateLedgerAccount(id, data);
// };

// export const deleteLedgerAccount = async (id: number) => {
//   return ledgerAccountRepository.deleteLedgerAccount(id);
// };
