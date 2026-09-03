const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'stone_erp'
  });
  
  const [rows] = await connection.execute("SHOW COLUMNS FROM journal_entries LIKE 'referenceType';");
  console.log(rows[0].Type);
  
  const [rows2] = await connection.execute("SHOW COLUMNS FROM journal_entries LIKE 'entryFor';");
  console.log(rows2[0].Type);
  
  await connection.end();
}
run();
