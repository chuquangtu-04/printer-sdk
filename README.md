# @nemo/printer-sdk

TypeScript SDK for calling the local NemoPOS Printer Service from a frontend app.

The SDK does not replace the desktop service. The desktop app must be installed and running on the user's machine. This SDK wraps the local HTTP API exposed by the desktop service.

## Install

```bash
npm install @nemo/printer-sdk
```

## Basic Usage

```ts
import { PrinterSDK } from '@nemo/printer-sdk';

const printer = new PrinterSDK();

const health = await printer.health();
const printers = await printer.getPrinters();

await printer.printKitchen(printers[0].id, {
  language: 'vi',
  table: '208',
  orderId: 'ORD-F1D-AB793B',
  orderNote: 'Ban co tre em',
  items: [
    { name: 'Pho bo tai', qty: 1, note: 'Nhieu rau' },
    { name: 'Pho bo chin', qty: 1, note: 'Nhieu bo' },
  ],
});
```

## Custom Base URL

The default service URL is:

```text
http://localhost:9000
```

Override it if needed:

```ts
const printer = new PrinterSDK({
  baseUrl: 'http://localhost:9000',
});
```

## API

```ts
await printer.health();
await printer.getPrinters();
await printer.testPrint(printerId);
await printer.print(payload);
await printer.printReceipt(printerId, data);
await printer.printKitchen(printerId, data);
await printer.printBill(printerId, data);
await printer.printLabel(printerId, data);
await printer.getQueue();
await printer.retryQueue();
await printer.retryQueue({ id: 5 });
await printer.clearQueue();
```

## Build

```bash
npm install
npm run build
```

## Publish

```bash
npm login
npm publish --access public
```
