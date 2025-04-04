import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES } from "../constants/coa";

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
