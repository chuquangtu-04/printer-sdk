const { PrinterSDK } = require('@nemoprint/printer-sdk');

async function main() {
  const printer = new PrinterSDK();

  const health = await printer.health();
  console.log('Health:');
  console.log(JSON.stringify(health, null, 2));

  const printers = await printer.getPrinters();
  console.log('Printers:');
  console.log(JSON.stringify(printers, null, 2));

  const queue = await printer.getQueue();
  console.log('Queue:');
  console.log(JSON.stringify(queue, null, 2));

  const failedQueue = await printer.getFailedQueue();
  console.log('Failed queue:');
  console.log(JSON.stringify(failedQueue, null, 2));

  // Example for the new top-level receipt payload:
  // await printer.printInvoice({
  //   printer: 'XP-80C',
  //   template: 'receipt',
  //   header: {
  //     store_name: 'Nguyen Van Muoi',
  //     address: '269 Nguyen Van Huyen',
  //     phone: '01234567899888',
  //   },
  //   branch_name: 'main-branch',
  //   invoice: {
  //     title: 'HOA DON BAN HANG',
  //     code: 'SAL-FYE-FC6F9A',
  //     created_at: '13/08/2026 16:36:09',
  //     customer: 'Khach Le',
  //     seller: '0123456789',
  //   },
  //   items: [
  //     {
  //       name: 'Cai bo thom',
  //       quantity: 1,
  //       unit_price: 62000,
  //       discount: 50000,
  //       amount: 12000,
  //     },
  //   ],
  //   summary: {
  //     subtotal: 12000,
  //     discount: 1200,
  //     voucher: 0,
  //     points: 10000,
  //     tax: 1377.34,
  //     total: 800,
  //   },
  //   payment: {
  //     method: 'cash',
  //     amount: 800,
  //   },
  // });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
