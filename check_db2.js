const mysql = require('mysql2/promise');

async function run() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'stone_erp_v2'
  });
  
  const [rows] = await connection.execute("SHOW COLUMNS FROM journal_entries LIKE 'referenceType';");
  console.log(rows[0].Type);
  
  const [rows2] = await connection.execute("SHOW COLUMNS FROM journal_entries LIKE 'entryFor';");
  console.log(rows2[0].Type);
  
  await connection.end();
}
run();
