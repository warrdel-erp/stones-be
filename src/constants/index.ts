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
