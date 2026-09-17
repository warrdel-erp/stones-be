const { sequelize } = require('./src/config/database');
const models = require('./src/models');
const { Op } = require('sequelize');

async function run() {
    try {
        const sopIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // just example
        const items = await models.DeliveryItem.findAll({
            where: { salesOrderProductId: { [Op.gt]: 0 } },
            include: [{ association: 'delivery' }]
        });
        console.log("Found Delivery Items: ", items.length);
        if (items.length > 0) {
            console.log("Sample delivery item:", JSON.stringify(items[0], null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
run();
