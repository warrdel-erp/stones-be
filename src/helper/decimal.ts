import Decimal from 'decimal.js';

/**
 * Common Decimal utility functions with 2 decimal places
 * All functions take number and return number with 2 decimal places
 */

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
export const decimalMultiply = (a: number, b: number): number => {
    return new Decimal(a).times(b).toDP(2).toNumber();
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