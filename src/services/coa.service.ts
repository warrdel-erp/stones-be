import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES } from "../constants/coa";
import { getLedgerAccountsWithoutPagination } from "../repositories/ledgerAccount.repository";
import JournalEntry from "../models/journalEntry.model";

export const getCoaData = () => {
  return {
    types: COA_TYPES,
    headers: COA_HEADERS,
    subHeader: COA_SUB_HEADERS,
  };
};

export const buildNestedCOA = () => {
  return COA_TYPES.map((type) => {
    const headersForType = COA_HEADERS
      .filter((header) => header.parent_id === type.id)
      .map((header) => {
        const subHeadersForHeader = COA_SUB_HEADERS.filter(
          (sub) => sub.parent_id === header.id
        );

        return {
          ...header,
          subHeaders: subHeadersForHeader,
        };
      });

    return {
      ...type,
      headers: headersForType,
    };
  });
};

export const getBalanceSheetData = async (clientId: number) => {
  const nestedData = buildNestedCOA().filter(e => [1, 2].includes(e.id));

  // Helper to get last journal entry balance for a ledger
  const getLedgerLastBalance = async (ledgerId: number) => {
    const lastEntry = await JournalEntry.findOne({
      where: { ledgerId },
      order: [["createdAt", "DESC"]],
    });
    return lastEntry ? Number(lastEntry.get("balance")) : 0;
  };

  // Create a new structure with ledger accounts and balances
  const data = await Promise.all(nestedData.map(async (type) => {
    let typeBalance = 0;
    const headersWithLedgerAccounts = await Promise.all(type.headers.map(async (header) => {
      let headerBalance = 0;

      const subHeadersWithLedgerAccounts = await Promise.all(header.subHeaders.map(async (subHeader) => {
        // Fetch ledger accounts for this subheader and client
        const ledgerAccounts = await getLedgerAccountsWithoutPagination({
          subHeaderId: subHeader.id,
          clientId: clientId
        });
        // For each ledger, get last journal entry balance
        const ledgerAccountsWithBalance = await Promise.all(ledgerAccounts.map(async (ledger: any) => {
          const ledgerPlain = ledger.get ? ledger.get({ plain: true }) : ledger;
          const balance = await getLedgerLastBalance(ledger.id);
          return { ...ledgerPlain, balance };
        }));

        // Sum all ledger balances for this subHeader
        const subHeaderBalance = ledgerAccountsWithBalance.reduce((sum, l) => sum + (Number(l.balance) || 0), 0);
        headerBalance += subHeaderBalance;
        return {
          ...subHeader,
          balance: subHeaderBalance,
          ledgerAccounts: ledgerAccountsWithBalance,
        };
      }));

      typeBalance += headerBalance;

      return {
        ...header,
        balance: headerBalance,
        subHeaders: subHeadersWithLedgerAccounts,
      };
    }));
    return {
      ...type,
      balance: typeBalance,
      headers: headersWithLedgerAccounts,
    };
  }));

  return data;
};