export const INVENTORY_ITEM_STATUS = {
  INITIATE: "INITIATE",
  IN_INVENTORY: "IN_INVENTORY",
  ALLOCATED: "ALLOCATED",
  SOLD: "SOLD",
  BROKEN: "BROKEN",
} as const;

export const PRODUCT_COLORS = {
  BLACK: "Black",
  BEIGE: "Beige",
  BLUE: "Blue",
  DARK_BLUE: "Dark Blue",
  BROWN: "Brown",
  PINK: "Pink",
  GOLD: "Gold",
  GRAY: "Gray",
  CRIMSON: "Crimson",
  RED: "Red",
  DARK_RED: "Dark Red",
  MUTE_RED: "Mute Red",
  WHITE: "White",
  YELLOW: "Yellow",
  GREEN: "Green",
  SEA_GREEN: "Sea Green",
  MUTE_SEA_GREEN: "Mute sea green",
  LIGHT_GREEN: "light Green",
} as const;

export const UNITS_OF_MEASUREMENT = [
  { id: 1, name: "Square Foot", code: 'SF' },
  // { id: 2, name: "Square Meter" },
  // { id: 3, name: "Square Inch" },
  // { id: 4, name: "Square Yard" },
  // { id: 5, name: "Square Centimeter" },
  // { id: 6, name: "Cubic Foot" },
  // { id: 7, name: "Cubic Meter" },
  // { id: 8, name: "Cubic Inch" },
  // { id: 9, name: "Cubic Centimeter" },
  // { id: 10, name: "Kilogram" },
  // { id: 11, name: "Metric Ton" },
  // { id: 12, name: "Pound" },
  // { id: 13, name: "Ounce" },
  { id: 14, name: "EA", code: "EA" },
] as const;

export const DELIVERY_TYPE = {
  Pickup: "Pickup",
  Delivery: "Delivery",
  Other: "Other",
};

export const PAYMENT_TERMS = [
  { id: 1, value: "30" },
  { id: 2, value: "45" },
  { id: 3, value: "60" },
  { id: 4, value: "90" },
  { id: 5, value: "120" },
  { id: 6, value: "COD" },
];

export const SHIPMENT_TERMS = [
  { id: 1, value: "Prepaid" },
  { id: 2, value: "Prepaid & Add" },
  { id: 3, value: "Collect" },
  { id: 4, value: "Prepaid & COD" },
  { id: 5, value: "Add & COD" },
  { id: 6, value: "Collect & COD" },
  { id: 7, value: "Credit 45" },
  { id: 8, value: "CAD" },
  { id: 9, value: "Consignment" },
] as const;

export const SCOP = [
  { id: 1, value: "National" },
  { id: 2, value: "International" },
] as const;

export const LANGUAGES = [
  { id: 1, value: "Hindi", code: "hi" },
  { id: 2, value: "English", code: "en" },
  { id: 3, value: "Marathi", code: "mr" },
] as const;

export const FINISH = [
  { id: 1, value: "F1" },
  { id: 2, value: "F2" },
  { id: 3, value: "F3" },
];

export const GROUPS = [
  { id: 1, value: "G1" },
  { id: 2, value: "G2" },
  { id: 3, value: "G3" },
];

export const PRODUCT_KIND = [
  { id: 1, value: "Stock" },
  { id: 2, value: "Non-Stock" },
] as const;

export const SALES_TAX = [
  { id: 1, code: "GW", label: "Georgia State, Gwinnett County", value: 6, stateTax: 4 },
  { id: 2, code: "FR", label: "Georgia State, Forsyth County", value: 7, stateTax: 4 },
  { id: 3, code: "EX", label: "Tax Exempt", value: 0 },
  { id: 4, code: "FUL-ATL", label: "Georgia State, FUL, City of Atlanta", value: 8.9, stateTax: 4 },
  { id: 5, code: "FUL", label: "Georgia State, Fulton County", value: 7.75, stateTax: 4 },
  { id: 6, code: "COB", label: "Georgia State, Cobb County", value: 6, stateTax: 4 },
  { id: 7, code: "DAW", label: "Georgia State, Dawson County", value: 7, stateTax: 4 },
  { id: 8, code: "DEK", label: "Georgia State, Dekalb County", value: 8, stateTax: 4 },
  { id: 9, code: "DEK-ATL", label: "Georgia State, DEK, City of Atlanta", value: 8.9, stateTax: 4 },
  { id: 10, code: "DOU", label: "Georgia State, Douglas County", value: 7, stateTax: 4 },
  { id: 11, code: "COW", label: "Georgia State, Coweta County Tax", value: 7, stateTax: 4 },
  { id: 12, code: "CHE", label: "Georgia State, Cherokee County Tax", value: 6, stateTax: 4 },
  { id: 13, code: "CLAY", label: "Georgia State, Clayton County Tax", value: 8, stateTax: 4 },
  { id: 14, code: "HEN", label: "Georgia State, Henry County Tax", value: 8, stateTax: 4 },
  { id: 15, code: "FAY", label: "Georgia State, Fayette County Tax", value: 7, stateTax: 4 },
  { id: 16, code: "HAL", label: "Georgia State, Hall County Tax", value: 7, stateTax: 4 },
  { id: 17, code: "GRN", label: "South Carolina State, Greenville County", value: 6 },
  { id: 18, code: "PAU", label: "Georgia State, Paulding County", value: 7, stateTax: 4 },
  { id: 19, code: "FLOY", label: "Georgia State, Floyd County", value: 7, stateTax: 4 },
  { id: 20, code: "BAR", label: "Georgia State, Bartow County", value: 7, stateTax: 4 },
  { id: 21, code: "ROC", label: "Georgia State, Rockdale County", value: 6, stateTax: 4 },
  { id: 22, code: "LOW", label: "Georgia State, Lowndes County", value: 8, stateTax: 4 },
  { id: 23, code: "BARW", label: "Georgia State, Barrow County", value: 8, stateTax: 4 },
  { id: 24, code: "NEW", label: "Georgia State, Newton County", value: 7, stateTax: 4 },
  { id: 25, code: "JAC", label: "Georgia State, Jackson County", value: 7, stateTax: 4 },
  { id: 26, code: "ELB", label: "Georgia State, Elbert County", value: 8, stateTax: 4 },
  { id: 27, code: "DOD", label: "Georgia State, Dodge County", value: 8, stateTax: 4 },
  { id: 28, code: "ALMA", label: "Alabama State, Madison County", value: 5.5, stateTax: 4 },
  { id: 29, code: "BIB", label: "Georgia State, Bibb County", value: 8, stateTax: 4 },
  { id: 30, code: "WHF", label: "Georgia State, Whitfield County", value: 7, stateTax: 4 },
  { id: 31, code: "ALCH", label: "Alabama State, Chambers County", value: 9, stateTax: 4 },
  { id: 32, code: "TNHA", label: "Tennessee State, Hamilton County", value: 9.25 },
  { id: 33, code: "GOR", label: "Georgia State, Gordon County", value: 7, stateTax: 4 },
  { id: 34, code: "SCOC", label: "South Carolina State, Oconee County", value: 6 },
  { id: 35, code: "TWNS", label: "Georgia State, Towns County", value: 8, stateTax: 4 },
  { id: 36, code: "THOM", label: "Georgia State, Thomas County", value: 7, stateTax: 4 },
  { id: 37, code: "STE", label: "Georgia State, Stephens County", value: 7, stateTax: 4 },
  { id: 38, code: "TUR", label: "Georgia State, Turner County", value: 8, stateTax: 4 },
  { id: 39, code: "JAC-NC", label: "North Carolina State, Jackson County", value: 7, stateTax: 4.75 },
  { id: 40, code: "UNI", label: "Georgia State, Union County", value: 7, stateTax: 4 },
  { id: 41, code: "GIL", label: "Georgia State, Gilmer County", value: 7, stateTax: 4 },
  { id: 42, code: "OGL", label: "Georgia State, Oglethorpe County", value: 8, stateTax: 4 },
  { id: 43, code: "MSCG", label: "Georgia State, Muscogee County", value: 9, stateTax: 4 },
  { id: 44, code: "ALMO", label: "Alabama State, Montgomery County", value: 10, stateTax: 4 },
];












