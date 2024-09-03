// filterKeysUtils.js

/**
 * Filters out keys from an object where the values are null, undefined, or an empty string.
 * @param {Object} obj - The object to filter.
 * @returns {Object} - The filtered object.
 */
const filterObject = (obj) => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => {
            if (typeof value === 'string') {
                return value.trim() !== "";
            }
            return value !== null && value !== undefined;
        })
    );
};

export default filterObject;
