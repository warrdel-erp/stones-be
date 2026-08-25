const Sequelize = require("sequelize");
const sequelize = new Sequelize('mysql://user:pass@localhost:3306/db');

const Test = sequelize.define("Test", { status: Sequelize.STRING });

try {
  const sql = sequelize.dialect.queryGenerator.selectQuery(
    Test.getTableName(),
    {
      model: Test,
      where: {
        status: { [Sequelize.Op.eq]: ['IN_INVENTORY', 'INITIATE'] }
      }
    },
    Test
  );
  console.log("SQL:", sql);
} catch (e) {
  console.log("ERROR:", e.message);
}
