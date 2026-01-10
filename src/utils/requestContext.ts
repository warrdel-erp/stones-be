import { AsyncLocalStorage } from "node:async_hooks";

export const requestContext = new AsyncLocalStorage<{
  clientId?: number;
  locationId?: number;
}>();
