import "dotenv/config";
import { sequelize } from "./src/config/database";
import Warehouse from "./src/models/warehouse.model";
import Area from "./src/models/area.model";
import Bin from "./src/models/bin.model";

async function backfillAreas() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");
    await sequelize.sync({ alter: true });
    console.log("Synced models.");

    // Fetch all warehouses
    const warehouses = await Warehouse.findAll();
    console.log(`Found ${warehouses.length} warehouses.`);

    for (const warehouse of warehouses) {
      // Find or create default area
      const [defaultArea] = await Area.findOrCreate({
        where: {
          warehouseId: (warehouse as any).id,
          name: `Default Area`,
        },
        defaults: {
          warehouseId: (warehouse as any).id,
          name: `Default Area`,
          clientId: (warehouse as any).clientId,
          locationId: (warehouse as any).locationId,
        }
      });
      console.log(`Created or found Default Area for warehouse ${(warehouse as any).name}`);

      // Update bins that have this warehouseId but no areaId
      const [affectedCount] = await Bin.update(
        { areaId: (defaultArea as any).id },
        {
          where: {
            warehouseId: (warehouse as any).id,
            areaId: null,
          }
        }
      );
      console.log(`Updated ${affectedCount} bins for warehouse ${(warehouse as any).name}`);
    }

    console.log("Backfill completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error backfilling areas:", error);
    process.exit(1);
  }
}

backfillAreas();
