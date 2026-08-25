const Sequelize = require("sequelize");
const sequelize = new Sequelize("sqlite::memory:");

const Product = sequelize.define("Product", { name: Sequelize.STRING });
const InventoryProduct = sequelize.define("InventoryProduct", { name: Sequelize.STRING });
const Slab = sequelize.define("Slab", { lot: Sequelize.STRING, block: Sequelize.STRING });

InventoryProduct.hasOne(Slab, { foreignKey: "inventoryProductId" });

const q1 = InventoryProduct.findAll({
  include: [
    {
      association: "Slab",
      where: { receivingLength: 50 },
      required: false,
    }
  ],
  order: [
    [{ model: Slab, as: "Slab" }, "lot", "ASC"]
  ]
});

console.log(q1);
