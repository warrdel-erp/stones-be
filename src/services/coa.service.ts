import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES } from "../constants/coa";
import { getLedgerAccountsWithoutPagination } from "../repositories/ledgerAccount.repository";

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

  // Create a new structure with ledger accounts
  const data = await Promise.all(nestedData.map(async (type) => {
    const headersWithLedgerAccounts = await Promise.all(type.headers.map(async (header) => {
      const subHeadersWithLedgerAccounts = await Promise.all(header.subHeaders.map(async (subHeader) => {
        // Fetch ledger accounts for this subheader and client
        const ledgerAccounts = await getLedgerAccountsWithoutPagination({
          subHeaderId: subHeader.id,
          clientId: clientId
        });

        // Return subheader with ledger accounts
        return {
          ...subHeader,
          ledgerAccounts: ledgerAccounts
        };
      }));

      return {
        ...header,
        subHeaders: subHeadersWithLedgerAccounts
      };
    }));

    return {
      ...type,
      headers: headersWithLedgerAccounts
    };
  }));

  return data;
};