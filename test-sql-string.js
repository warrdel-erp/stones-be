const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://user:pass@localhost:3306/db');

const InventoryProduct = sequelize.define("InventoryProduct", { name: Sequelize.STRING });
const Slab = sequelize.define("Slab", { lot: Sequelize.STRING, block: Sequelize.STRING });

InventoryProduct.hasOne(Slab, { foreignKey: "inventoryProductId" });
Slab.belongsTo(InventoryProduct, { foreignKey: "inventoryProductId", as: "inventoryProduct" });

try {
  const q1 = InventoryProduct.findAll({
    include: [{
      association: "Slab",
      required: false
    }],
    order: [
      ["Slab", "lot", "ASC"],
      ["Slab", "block", "ASC"]
    ]
  }).then(() => {}).catch(e => console.log(e.sql || e.message));
} catch (e) {
  console.log("ERROR:", e.message);
}
