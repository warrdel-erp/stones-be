import { AsyncLocalStorage } from "node:async_hooks";

export const requestContext = new AsyncLocalStorage<{
  clientId?: number;
  companyId?: number;
  locationId?: number;
  accountId?: number;
  locationScope?: "location" | "company";
  roleId?: number;
}>();
