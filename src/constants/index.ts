export const SLAB_STATUS = {
  INITIATE: "INITIATE",
  IN_TRANSIT: "IN_TRANSIT",
  IN_INVENTORY: "IN_INVENTORY",
  ALLOCATED: "ALLOCATED",
  SOLD: "SOLD",
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
  { id: 1, name: "Square Foot" },
  { id: 2, name: "Square Meter" },
  { id: 3, name: "Square Inch" },
  { id: 4, name: "Square Yard" },
  { id: 5, name: "Square Centimeter" },
  { id: 6, name: "Cubic Foot" },
  { id: 7, name: "Cubic Meter" },
  { id: 8, name: "Cubic Inch" },
  { id: 9, name: "Cubic Centimeter" },
  { id: 10, name: "Kilogram" },
  { id: 11, name: "Metric Ton" },
  { id: 12, name: "Pound" },
  { id: 13, name: "Ounce" },
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

export const VENDOR_SCOP = [
  { id: 1, value: "National" },
  { id: 2, value: "International" },
] as const;

export const LANGUAGES = [
  { id: 1, value: "Hindi", code: "hi" },
  { id: 2, value: "English", code: "en" },
  { id: 3, value: "Marathi", code: "mr" },
] as const;

export const THICKNESS = [
  { id: 1, value: "1 CM" },
  { id: 2, value: "2 CM" },
  { id: 3, value: "3 CM" },
];

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
