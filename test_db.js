const { getInvoiceDetailsById } = require('./src/repositories/soInvoice.repository');
const models = require('./src/models');

async function run() {
  try {
    const inv = await getInvoiceDetailsById(21);
    console.log(inv ? "Success!" : "Not found!");
    process.exit(0);
  } catch(e) {
    console.error(e.message);
    process.exit(1);
  }
}
run();
