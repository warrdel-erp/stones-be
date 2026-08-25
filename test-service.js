const { addRequirement } = require("./src/services/opportunity.service");
const models = require("./src/models");
const { requestContext } = require("./src/utils/requestContext");

async function run() {
  await models.sequelize.authenticate();
  console.log("Connected");
  requestContext.run({ clientId: 1, locationId: 1, userId: 1 }, async () => {
    try {
      const res = await addRequirement(26, {
        productId: 1,
        unitType: "slabs",
        requiredCount: 2,
        minLength: 50,
        minWidth: 50
      }, 1);
      console.log("SUCCESS:", res);
    } catch (e) {
      console.log("ERROR:", e.message);
    }
    process.exit(0);
  });
}
run();
