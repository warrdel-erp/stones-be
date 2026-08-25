const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://user:pass@localhost:3306/db');

const InventoryProduct = sequelize.define("InventoryProduct", { name: Sequelize.STRING });
const Slab = sequelize.define("Slab", { lot: Sequelize.STRING, block: Sequelize.STRING });

InventoryProduct.hasOne(Slab, { foreignKey: "inventoryProductId" });
Slab.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });

// Try both includes
const query1 = InventoryProduct.findAll({
  include: [{
    association: "Slab",
    required: false
  }],
  order: [
    [{ model: Slab, as: 'Slab' }, "lot", "ASC"]
  ]
});

// Since we can't execute without connection, we use the queryGenerator
const sql = sequelize.dialect.queryGenerator.selectQuery(
  InventoryProduct.getTableName(),
  {
    model: InventoryProduct,
    include: InventoryProduct._validateIncludedElements({
      include: [{ association: "Slab", required: false }],
      model: InventoryProduct
    }).include,
    order: [
      [{ model: Slab, as: 'Slab' }, "lot", "ASC"]
    ]
  },
  InventoryProduct
);
console.log(sql);
