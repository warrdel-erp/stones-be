import { COA_HEADERS, COA_SUB_HEADERS, COA_TYPES } from "../constants/coa";

export const getCoaData = () => {
  return {
    types: COA_TYPES,
    headers: COA_HEADERS,
    subHeader: COA_SUB_HEADERS,
  };
};
