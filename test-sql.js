const { Op } = require("sequelize");
const { getAvailableInventoryProductsForProduct } = require("./src/repositories/product.repository");

async function run() {
  try {
    await getAvailableInventoryProductsForProduct(1, 1, undefined, undefined, 50, undefined);
    console.log("SUCCESS!");
  } catch(e) {
    console.error("ERROR CAUGHT: ", e.message);
  }
  process.exit(0);
}
run();
