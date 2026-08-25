const { Op } = require("sequelize");
const models = require("./src/models");
const { getAvailableInventoryProductsForProduct } = require("./src/repositories/product.repository");

async function run() {
  try {
    models.sequelize.options.dialect = 'mysql';
    const originalFindAll = models.InventoryProduct.findAll;
    models.InventoryProduct.findAll = function(options) {
      console.log("OPTIONS:", JSON.stringify(options, null, 2));
      const sql = models.sequelize.dialect.queryGenerator.selectQuery(
        models.InventoryProduct.getTableName(),
        options,
        models.InventoryProduct
      );
      console.log("SQL:", sql);
      return Promise.resolve([]);
    };

    await getAvailableInventoryProductsForProduct(1, 1, 50, undefined, 50, undefined);
  } catch(e) {
    console.error("ERROR CAUGHT: ", e.message);
  }
  process.exit(0);
}
run();
