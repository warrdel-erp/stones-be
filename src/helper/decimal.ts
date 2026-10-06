import Decimal from 'decimal.js';

/**
 * Add two numbers with 2 decimal places
 */
export const decimalAdd = (a: number, b: number): number => {
    return new Decimal(a).plus(b).toDP(2).toNumber();
};

/**
 * Subtract two numbers with 2 decimal places
 */
export const decimalSubtract = (a: number, b: number): number => {
    return new Decimal(a).minus(b).toDP(2).toNumber();
};

/**
 * Multiply two numbers with 2 decimal places
 */
export const decimalMultiply = (...args: number[]): number => {
    return args.reduce((acc, arg) => new Decimal(acc).times(arg).toDP(2).toNumber(), 1);
};

/**
 * Divide two numbers with 2 decimal places
 */
export const decimalDivide = (a: number, b: number): number => {
    if (b === 0) throw new Error('Division by zero');
    return new Decimal(a).dividedBy(b).toDP(2).toNumber();
};

/**
 * Calculate sum of an array of numbers with 2 decimal places
 */
export const decimalSum = (numbers: number[]): number => {
    return numbers.reduce((sum, num) => decimalAdd(sum, num), 0);
};

/**
 * Compare two numbers - returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export const decimalCompare = (a: number, b: number): number => {
    return new Decimal(a).comparedTo(b);
};

/**
 * Check if two numbers are equal
 */
export const decimalEquals = (a: number, b: number): boolean => {
    return decimalCompare(a, b) === 0;
};

/**
 * Check if a number is greater than another
 */
export const decimalGreaterThan = (a: number, b: number): boolean => {
    return decimalCompare(a, b) > 0;
};

/**
 * Check if a number is greater than or equal to another
 */
export const decimalGreaterThanOrEqual = (a: number, b: number): boolean => {
    return decimalCompare(a, b) >= 0;
};

/**
 * Check if a number is less than another
 */
export const decimalLessThan = (a: number, b: number): boolean => {
    return decimalCompare(a, b) < 0;
};

/**
 * Check if a number is less than or equal to another
 */
export const decimalLessThanOrEqual = (a: number, b: number): boolean => {
    return decimalCompare(a, b) <= 0;
};

/**
 * Get the minimum of two numbers with 2 decimal places
 */
export const decimalMin = (a: number, b: number): number => {
    const min = decimalLessThan(a, b) ? a : b;
    return new Decimal(min).toDP(2).toNumber();
};

/**
 * Get the maximum of two numbers with 2 decimal places
 */
export const decimalMax = (a: number, b: number): number => {
    const max = decimalGreaterThan(a, b) ? a : b;
    return new Decimal(max).toDP(2).toNumber();
};
/**
 * Calculate the value of a given percentage of an amount (e.g. 5% of 100)
 */
export const decimalValueByPercentage = (amount: number, percentage: number, dp: number = 2): number => {
    return new Decimal(amount).times(percentage).dividedBy(100).toDP(dp).toNumber();
};

/**
 * Calculate the percentage a value represents out of a total
 */
export const decimalPercentage = (value: number, total: number, dp: number = 2): number => {
    if (total === 0) return 0;
    return new Decimal(value).dividedBy(total).times(100).toDP(dp).toNumber();
};

/**
 * Add two numbers with specified decimal places (defaults to 3)
 */
export const decimalAddDP = (a: number, b: number, dp: number = 2): number => {
    return new Decimal(a).plus(b).toDP(dp).toNumber();
};

/**
 * Subtract two numbers with specified decimal places (defaults to 3)
 */
export const decimalSubtractDP = (a: number, b: number, dp: number = 2): number => {
    return new Decimal(a).minus(b).toDP(dp).toNumber();
};
