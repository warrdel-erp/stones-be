const { sequelize } = require('./src/config/database');
const models = require('./src/models');

async function main() {
    const trucks = await models.Truck.findAll({
        include: [{
            association: 'deliveries',
            include: [{
                association: 'deliveryAddresses',
                include: ['packagingList', 'loadingOrder', 'deliveryItems']
            }]
        }]
    });
    const deliveries = trucks.flatMap(t => t.get('deliveries'));
    console.log(JSON.stringify(deliveries, null, 2));
    process.exit(0);
}
main();
