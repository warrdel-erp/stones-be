const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://user:pass@localhost:3306/db');

const InventoryProduct = sequelize.define("InventoryProduct", { name: Sequelize.STRING });
const Slab = sequelize.define("Slab", { lot: Sequelize.STRING, block: Sequelize.STRING });

InventoryProduct.hasOne(Slab, { foreignKey: "inventoryProductId" });
Slab.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });

const q1 = InventoryProduct.findAll({
  include: [{
    association: "slab",
    required: false
  }],
  order: [
    [{ model: Slab, as: 'slab' }, "lot", "ASC"]
  ]
}).then(() => {}).catch(e => console.log(e.sql || e.message));

