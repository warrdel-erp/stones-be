import { sequelize } from "./src/config/database";
import * as models from "./src/models";

const test = async () => {
    try {
        await sequelize.authenticate();
        const items: any = await models.DeliveryItem.findAll({ raw: true });
        console.log("All DeliveryItems:", items.slice(0, 5));
        
        const salesOrderProducts: any = await models.SalesOrderProduct.findAll({ where: { salesOrderId: 56 }, raw: true });
        console.log("SOPs for SO 56:", salesOrderProducts.map((s: any) => s.id));
        
        const matched = items.filter((i: any) => salesOrderProducts.some((s: any) => s.id === i.salesOrderProductId));
        console.log("Matched items for SO 56:", matched);
        
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
test();
