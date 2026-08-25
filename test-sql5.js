const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://user:pass@localhost:3306/db');

const InventoryProduct = sequelize.define("InventoryProduct", { name: Sequelize.STRING });
const Slab = sequelize.define("Slab", { lot: Sequelize.STRING, block: Sequelize.STRING });

InventoryProduct.hasOne(Slab, { foreignKey: "inventoryProductId" });
Slab.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });

try {
  const sql = sequelize.dialect.queryGenerator.selectQuery(
    InventoryProduct.getTableName(),
    {
      model: InventoryProduct,
      include: InventoryProduct._validateIncludedElements({
        include: [{ association: "Slab", required: false }],
        model: InventoryProduct
      }).include,
      order: [
        [{ model: Slab, as: 'slab' }, "lot", "ASC"]
      ]
    },
    InventoryProduct
  );
  console.log("SQL:", sql);
} catch (e) {
  console.log("ERROR:", e.message);
}
