import Decimal from "decimal.js";
import { decimalDivide } from "./decimal";

export const removeDuplicates = (array: any[]) =>
  array.filter((item, index, self) => index === self.findIndex((obj) => obj.id === item.id));

export const removeDuplicatesWithUnitPrice = (array: any[]) =>
  array.filter(
    (item, index, self) => index === self.findIndex((obj) => obj.id === item.id && obj.unitPrice === item.unitPrice)
  );

export const addPercentage = (value: number, percentage: number) =>
  value + (value * percentage) / 100;

export const getPercentageValue = (value: number, percentage: number) =>
  (value * percentage) / 100;

export const getPercentageValueFromValue = (total: number, value: number) =>
  (value / total) * 100;

export const randomId = () => Math.random().toString(36).substring(2, 10);

/**
 * Sums an array of numbers or array of objects with a key using decimal.js for precision
 * @param array - Array of numbers or array of objects
 * @param key - Optional key to extract value from objects (if array contains objects)
 * @returns Sum as a number rounded to 2 decimal places
 */
export const sumDecimal = (array: any[] | null | undefined, key?: string): number => {
  if (!array || array.length === 0) {
    return 0;
  }

  const sum = array.reduce((acc: Decimal, item: any) => {
    const value = key ? item?.[key] : item;
    return acc.plus(new Decimal(value || 0));
  }, new Decimal(0));

  return Number(sum.toDecimalPlaces(2));
};

export const convertSqrInchToFt = (sqrIn: number) => {
  return decimalDivide(sqrIn, 144)
}