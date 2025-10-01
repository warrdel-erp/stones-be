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