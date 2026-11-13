import { SALES_ORDER_STATUS } from "../constants/tableTypes";

/**
 * Check if a Sales Order is in draft (unpublished) status.
 */
export const isSalesOrderDraft = (salesOrder: any): boolean => {
  if (!salesOrder) return false;
  return salesOrder.status === SALES_ORDER_STATUS.DRAFT;
};

/**
 * Check if a Sales Order is published (not draft).
 */
export const isSalesOrderPublished = (salesOrder: any): boolean => {
  if (!salesOrder) return false;
  return (
    salesOrder.status === SALES_ORDER_STATUS.OPEN ||
    salesOrder.status === SALES_ORDER_STATUS.COMPLETED ||
    salesOrder.status === SALES_ORDER_STATUS.CLOSED
  );
};

/**
 * Check if a Sales Order is open.
 */
export const isSalesOrderOpen = (salesOrder: any): boolean => {
  if (!salesOrder) return false;
  return salesOrder.status === SALES_ORDER_STATUS.OPEN;
};

/**
 * Check if a Sales Order is closed or cancelled.
 */
export const isSalesOrderClosed = (salesOrder: any): boolean => {
  if (!salesOrder) return false;
  return (
    salesOrder.status === SALES_ORDER_STATUS.CLOSED ||
    salesOrder.status === SALES_ORDER_STATUS.CANCELLED
  );
};

