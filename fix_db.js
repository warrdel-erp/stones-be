const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'stone_erp'
  });
  
  await connection.execute("ALTER TABLE journal_entries MODIFY COLUMN referenceType ENUM('SIPL','BILL','PACKAGING_LIST','PACKAGING_LIST_INVOICE','LOADING_ORDER','LOADING_ORDER_INVOICE','SALES_ORDER','RETURN','ADVANCE_DEPOSIT');");
  
  await connection.execute("ALTER TABLE journal_entries MODIFY COLUMN entryFor ENUM('SIPL','PACKAGING_LIST','LOADING_ORDER','RETURN');");
  
  console.log("Altered successfully.");
  await connection.end();
}
run();
