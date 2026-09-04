import dotenv from 'dotenv';
dotenv.config();
import { sequelize } from './src/config/database';
import { QueryTypes } from 'sequelize';

async function run() {
    try {
        await sequelize.authenticate();
        console.log("Connected to DB.");

        // 1. Add createdById to sales_orders, packaging_lists, loading_orders
        const tables = ['sales_orders', 'packaging_lists', 'loading_orders'];
        for (const table of tables) {
            try {
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN createdById INT NULL;`);
                console.log(`Added createdById to ${table}`);
            } catch (e) {
                console.log(`Column might already exist in ${table}:`, e.message);
            }
        }

        // 2. Backfill Sales Orders (Copy accountId if exists)
        await sequelize.query(`UPDATE sales_orders SET createdById = accountId WHERE createdById IS NULL;`);
        console.log("Backfilled sales_orders from accountId.");

        // 3. Helper to find a default user's accountId for a given location
        const backfillTable = async (tableName) => {
            const records = await sequelize.query(`SELECT id, locationId FROM ${tableName} WHERE createdById IS NULL;`, { type: QueryTypes.SELECT });
            let backfilledCount = 0;
            for (const record of records) {
                if (!record.locationId) continue;
                
                // Find a user accountId associated with this location
                // Look in user_locations or users table
                const users = await sequelize.query(`
                    SELECT u.createdById as accountId
                    FROM users u
                    JOIN user_locations ul ON ul.userId = u.id
                    WHERE ul.locationId = ?
                    LIMIT 1
                `, { replacements: [record.locationId], type: QueryTypes.SELECT });
                
                let accountId = users[0]?.accountId;
                if (!accountId) {
                    // Fallback to any user
                    const anyUser = await sequelize.query(`SELECT createdById as accountId FROM users WHERE createdById IS NOT NULL LIMIT 1`, { type: QueryTypes.SELECT });
                    accountId = anyUser[0]?.accountId;
                }

                if (accountId) {
                    await sequelize.query(`UPDATE ${tableName} SET createdById = ? WHERE id = ?;`, {
                        replacements: [accountId, record.id]
                    });
                    backfilledCount++;
                }
            }
            console.log(`Backfilled ${backfilledCount} records in ${tableName}.`);
        };

        await backfillTable('packaging_lists');
        await backfillTable('loading_orders');

        // 4. Set NOT NULL
        for (const table of tables) {
            try {
                console.log(`Set NOT NULL on ${table}.createdById`);
                await sequelize.query(`ALTER TABLE ${table} MODIFY COLUMN createdById INT NOT NULL;`);
                await sequelize.query(`ALTER TABLE ${table} ADD CONSTRAINT fk_${table}_createdById FOREIGN KEY (createdById) REFERENCES accounts(id) ON DELETE RESTRICT ON UPDATE CASCADE;`);
            } catch (e) {
                console.log(`Error enforcing constraints on ${table}:`, e.message);
            }
        }

        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
