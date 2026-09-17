import { sequelize } from './src/config/database';
import * as models from './src/models';
import { findByIdSimple, findAll } from './src/repositories/truck.repository';

async function main() {
    const trucks = await findAll(1, 10);
    const deliveries = trucks.rows.flatMap((t: any) => t.get('deliveries'));
    console.log(JSON.stringify(deliveries, null, 2));
    process.exit(0);
}
main();
