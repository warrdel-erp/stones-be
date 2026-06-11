"use strict";

const COUNTRIES = [
  { id: 1, name: "Afghanistan" },
  { id: 2, name: "Albania" },
  { id: 3, name: "Algeria" },
  { id: 4, name: "Andorra" },
  { id: 5, name: "Angola" },
  { id: 6, name: "Antigua and Barbuda" },
  { id: 7, name: "Argentina" },
  { id: 8, name: "Armenia" },
  { id: 9, name: "Australia" },
  { id: 10, name: "Austria" },
  { id: 11, name: "Azerbaijan" },
  { id: 12, name: "Bahamas" },
  { id: 13, name: "Bahrain" },
  { id: 14, name: "Bangladesh" },
  { id: 15, name: "Barbados" },
  { id: 16, name: "Belarus" },
  { id: 17, name: "Belgium" },
  { id: 18, name: "Belize" },
  { id: 19, name: "Benin" },
  { id: 20, name: "Bhutan" },
  { id: 21, name: "Bolivia" },
  { id: 22, name: "Bosnia and Herzegovina" },
  { id: 23, name: "Botswana" },
  { id: 24, name: "Brazil" },
  { id: 25, name: "Brunei" },
  { id: 26, name: "Bulgaria" },
  { id: 27, name: "Burkina Faso" },
  { id: 28, name: "Burundi" },
  { id: 29, name: "Cabo Verde" },
  { id: 30, name: "Cambodia" },
  { id: 31, name: "Cameroon" },
  { id: 32, name: "Canada" },
  { id: 33, name: "Central African Republic" },
  { id: 34, name: "Chad" },
  { id: 35, name: "Chile" },
  { id: 36, name: "China" },
  { id: 37, name: "Colombia" },
  { id: 38, name: "Comoros" },
  { id: 39, name: "Congo (Congo-Brazzaville)" },
  { id: 40, name: "Costa Rica" },
  { id: 41, name: "Croatia" },
  { id: 42, name: "Cuba" },
  { id: 43, name: "Cyprus" },
  { id: 44, name: "Czechia (Czech Republic)" },
  { id: 45, name: "Democratic Republic of the Congo" },
  { id: 46, name: "Denmark" },
  { id: 47, name: "Djibouti" },
  { id: 48, name: "Dominica" },
  { id: 49, name: "Dominican Republic" },
  { id: 50, name: "Ecuador" },
  { id: 51, name: "Egypt" },
  { id: 52, name: "El Salvador" },
  { id: 53, name: "Equatorial Guinea" },
  { id: 54, name: "Eritrea" },
  { id: 55, name: "Estonia" },
  { id: 56, name: "Eswatini (fmr. 'Swaziland')" },
  { id: 57, name: "Ethiopia" },
  { id: 58, name: "Fiji" },
  { id: 59, name: "Finland" },
  { id: 60, name: "France" },
  { id: 61, name: "Gabon" },
  { id: 62, name: "Gambia" },
  { id: 63, name: "Georgia" },
  { id: 64, name: "Germany" },
  { id: 65, name: "Ghana" },
  { id: 66, name: "Greece" },
  { id: 67, name: "Grenada" },
  { id: 68, name: "Guatemala" },
  { id: 69, name: "Guinea" },
  { id: 70, name: "Guinea-Bissau" },
  { id: 71, name: "Guyana" },
  { id: 72, name: "Haiti" },
  { id: 73, name: "Holy See" },
  { id: 74, name: "Honduras" },
  { id: 75, name: "Hungary" },
  { id: 76, name: "Iceland" },
  { id: 77, name: "India" },
  { id: 78, name: "Indonesia" },
  { id: 79, name: "Iran" },
  { id: 80, name: "Iraq" },
  { id: 81, name: "Ireland" },
  { id: 82, name: "Israel" },
  { id: 83, name: "Italy" },
  { id: 84, name: "Jamaica" },
  { id: 85, name: "Japan" },
  { id: 86, name: "Jordan" },
  { id: 87, name: "Kazakhstan" },
  { id: 88, name: "Kenya" },
  { id: 89, name: "Kiribati" },
  { id: 90, name: "Kuwait" },
  { id: 91, name: "Kyrgyzstan" },
  { id: 92, name: "Laos" },
  { id: 93, name: "Latvia" },
  { id: 94, name: "Lebanon" },
  { id: 95, name: "Lesotho" },
  { id: 96, name: "Liberia" },
  { id: 97, name: "Libya" },
  { id: 98, name: "Liechtenstein" },
  { id: 99, name: "Lithuania" },
  { id: 100, name: "Luxembourg" },
  { id: 101, name: "Madagascar" },
  { id: 102, name: "Malawi" },
  { id: 103, name: "Malaysia" },
  { id: 104, name: "Maldives" },
  { id: 105, name: "Mali" },
  { id: 106, name: "Malta" },
  { id: 107, name: "Marshall Islands" },
  { id: 108, name: "Mauritania" },
  { id: 109, name: "Mauritius" },
  { id: 110, name: "Mexico" },
  { id: 111, name: "Micronesia" },
  { id: 112, name: "Moldova" },
  { id: 113, name: "Monaco" },
  { id: 114, name: "Mongolia" },
  { id: 115, name: "Montenegro" },
  { id: 116, name: "Morocco" },
  { id: 117, name: "Mozambique" },
  { id: 118, name: "Myanmar (formerly Burma)" },
  { id: 119, name: "Namibia" },
  { id: 120, name: "Nauru" },
  { id: 121, name: "Nepal" },
  { id: 122, name: "Netherlands" },
  { id: 123, name: "New Zealand" },
  { id: 124, name: "Nicaragua" },
  { id: 125, name: "Niger" },
  { id: 126, name: "Nigeria" },
  { id: 127, name: "North Korea" },
  { id: 128, name: "North Macedonia" },
  { id: 129, name: "Norway" },
  { id: 130, name: "Oman" },
  { id: 131, name: "Pakistan" },
  { id: 132, name: "Palau" },
  { id: 133, name: "Palestine State" },
  { id: 134, name: "Panama" },
  { id: 135, name: "Papua New Guinea" },
  { id: 136, name: "Paraguay" },
  { id: 137, name: "Peru" },
  { id: 138, name: "Philippines" },
  { id: 139, name: "Poland" },
  { id: 140, name: "Portugal" },
  { id: 141, name: "Qatar" },
  { id: 142, name: "Romania" },
  { id: 143, name: "Russia" },
  { id: 144, name: "Rwanda" },
  { id: 145, name: "Saint Kitts and Nevis" },
  { id: 146, name: "Saint Lucia" },
  { id: 147, name: "Saint Vincent and the Grenadines" },
  { id: 148, name: "Samoa" },
  { id: 149, name: "San Marino" },
  { id: 150, name: "Sao Tome and Principe" },
  { id: 151, name: "Saudi Arabia" },
  { id: 152, name: "Senegal" },
  { id: 153, name: "Serbia" },
  { id: 154, name: "Seychelles" },
  { id: 155, name: "Sierra Leone" },
  { id: 156, name: "Singapore" },
  { id: 157, name: "Slovakia" },
  { id: 158, name: "Slovenia" },
  { id: 159, name: "Solomon Islands" },
  { id: 160, name: "Somalia" },
  { id: 161, name: "South Africa" },
  { id: 162, name: "South Korea" },
  { id: 163, name: "South Sudan" },
  { id: 164, name: "Spain" },
  { id: 165, name: "Sri Lanka" },
  { id: 166, name: "Sudan" },
  { id: 167, name: "Suriname" },
  { id: 168, name: "Sweden" },
  { id: 169, name: "Switzerland" },
  { id: 170, name: "Syria" },
  { id: 171, name: "Tajikistan" },
  { id: 172, name: "Tanzania" },
  { id: 173, name: "Thailand" },
  { id: 174, name: "Timor-Leste" },
  { id: 175, name: "Togo" },
  { id: 176, name: "Tonga" },
  { id: 177, name: "Trinidad and Tobago" },
  { id: 178, name: "Tunisia" },
  { id: 179, name: "Turkey" },
  { id: 180, name: "Turkmenistan" },
  { id: 181, name: "Tuvalu" },
  { id: 182, name: "Uganda" },
  { id: 183, name: "Ukraine" },
  { id: 184, name: "United Arab Emirates" },
  { id: 185, name: "United Kingdom" },
  { id: 186, name: "United States of America" },
  { id: 187, name: "Uruguay" },
  { id: 188, name: "Uzbekistan" },
  { id: 189, name: "Vanuatu" },
  { id: 190, name: "Venezuela" },
  { id: 191, name: "Vietnam" },
  { id: 192, name: "Yemen" },
  { id: 193, name: "Zambia" },
  { id: 194, name: "Zimbabwe" },
];

function mapCountryToId(country) {
  if (country === null || country === undefined) return null;
  const cleanName = String(country).trim().toLowerCase();
  if (!cleanName) return null;

  // Exact ID match check
  const idNum = Number(cleanName);
  if (!isNaN(idNum) && Number.isInteger(idNum)) {
    const found = COUNTRIES.find((c) => c.id === idNum);
    if (found) return String(found.id);
  }

  // Pre-defined matches & aliases
  if (
    cleanName === "usa" ||
    cleanName === "us" ||
    cleanName === "united states" ||
    cleanName === "united states of america" ||
    cleanName === "u.s.a."
  ) {
    return "186";
  }
  if (cleanName === "uk" || cleanName === "united kingdom") {
    return "185";
  }
  if (cleanName === "india") {
    return "77";
  }

  const foundByName = COUNTRIES.find(
    (c) => c.name.toLowerCase() === cleanName
  );
  if (foundByName) {
    return String(foundByName.id);
  }

  return null;
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Fetch all vendors
    const [vendors] = await queryInterface.sequelize.query(
      "SELECT id, name, remitCountry, shippingCountry FROM vendors"
    );

    // 2. Loop and map country fields to correct IDs
    for (const vendor of vendors) {
      const newRemit = mapCountryToId(vendor.remitCountry);
      const newShipping = mapCountryToId(vendor.shippingCountry);

      if (
        newRemit !== vendor.remitCountry ||
        newShipping !== vendor.shippingCountry
      ) {
        await queryInterface.sequelize.query(
          "UPDATE vendors SET remitCountry = :remitCountry, shippingCountry = :shippingCountry WHERE id = :id",
          {
            replacements: {
              remitCountry: newRemit,
              shippingCountry: newShipping,
              id: vendor.id,
            },
          }
        );
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No-op or revert if necessary. Since strings are lossy, down can be kept empty or generic.
  },
};
