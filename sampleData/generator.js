const fs = require("fs");
const path = require("path");

const OUTPUT_FILE = path.join(__dirname, "customers.csv");
const TOTAL_ROWS = 10000; // 👈 change this number anytime

// ================= HEADERS =================

const headers = [
  "name",
  "email",
  "primaryPhoneNumber",
  "contactName",
  "printName",
  "secondaryPhoneNumber",
  "landlineNumber",
  "type",
  "priceLevel",
  "taxExempt",
  "salesTaxId",
  "paymentTermId",
  "internalNotes",
  "status",
  "scopeId",
  "shippingAddress",
  "shippingAddressLine",
  "shippingUnit",
  "shippingLat",
  "shippingLong",
  "shippingContactName",
  "shippingContactEmail",
  "shippingContactNumber",
  "shippingCountryId",
  "remitAddress",
  "remitAddressLine",
  "remitUnit",
  "remitLat",
  "remitLong",
  "remitContactName",
  "remitContactEmail",
  "remitContactNumber",
  "remitCountryId"
];

// ================= HELPERS =================

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBool = () => Math.random() > 0.5;
const randomFloat = (min, max) =>
  (Math.random() * (max - min) + min).toFixed(6);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ================= STATIC DATA =================

const companyNames = ["Acme", "Beta", "Gamma", "Delta", "Omega", "Nova"];
const companyTypes = ["Corp", "LLC", "Industries", "Solutions", "Group"];
const personNames = ["John", "Sarah", "Mike", "Jane", "Tom", "Lisa", "Bob"];
const streets = ["Main Street", "Oak Avenue", "Pine Road", "Maple Boulevard"];
const customerTypes = ["Wholesale", "Retail"];
const priceLevels = ["Standard", "Premium"];
const statusList = ["active", "inactive"];

// ================= PHONE GENERATOR =================

let phoneCounter = 5551000; // base number

const generatePhone = () => {
  phoneCounter += 1;
  return phoneCounter.toString();
};

// ================= ROW GENERATOR =================

const generateRow = (index) => {
  const company =
    randomFrom(companyNames) + " " + randomFrom(companyTypes);

  const contactName = randomFrom(personNames) + " Doe";
  const primaryPhone = generatePhone();

  const sameAddress = randomBool();

  return [
    company,
    `${company.toLowerCase().replace(/\s/g, "")}${index}@example.com`,
    primaryPhone,
    contactName,
    company,
    generatePhone(),
    randomBool() ? generatePhone() : "",
    randomFrom(customerTypes),
    randomFrom(priceLevels),
    randomBool(),
    randomInt(1, 44), // ✅ salesTaxId
    randomInt(1, 6),  // ✅ paymentTermId
    randomBool() ? "High value customer" : "",
    randomFrom(statusList),
    randomInt(1, 2),  // ✅ scopeId

    // -------- Shipping --------
    `${randomInt(1, 999)} ${randomFrom(streets)}`,
    randomBool() ? "Suite " + randomInt(1, 500) : "",
    randomBool() ? "U-" + randomInt(1, 50) : "",
    randomFloat(33.7000, 33.9000),
    randomFloat(-84.5000, -84.3000),
    contactName,
    `shipping${index}@example.com`,
    generatePhone(),
    randomInt(1, 194), // ✅ shippingCountryId

    // -------- Remit --------
    sameAddress
      ? `${randomInt(1, 999)} ${randomFrom(streets)}`
      : `${randomInt(1, 999)} Billing Street`,
    sameAddress ? "Same as shipping" : "",
    randomBool() ? "B-" + randomInt(1, 50) : "",
    randomFloat(33.7000, 33.9000),
    randomFloat(-84.5000, -84.3000),
    contactName,
    `billing${index}@example.com`,
    generatePhone(),
    randomInt(1, 194) // ✅ remitCountryId
  ];
};

// ================= CSV GENERATION =================

let csv = headers.join(",") + "\n";

for (let i = 1; i <= TOTAL_ROWS; i++) {
  const row = generateRow(i)
    .map((v) => `"${v}"`)
    .join(",");
  csv += row + "\n";
}

fs.writeFileSync(OUTPUT_FILE, csv);

console.log("✅ CSV generated successfully");
console.log(`📄 File: ${OUTPUT_FILE}`);
console.log(`📦 Rows: ${TOTAL_ROWS}`);
