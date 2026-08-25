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
  }],
  order: [
    [{ model: Slab, as: 'slab' }, "lot", "ASC"]
  ]
});

console.log(query1);
