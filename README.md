# @tpcoms/printer-sdk

SDK TypeScript dÃ¹ng Ä‘á»ƒ gá»i **NemoPOS Printer Service** Ä‘ang cháº¡y trÃªn mÃ¡y local cá»§a ngÆ°á»i dÃ¹ng.

SDK nÃ y khÃ´ng thay tháº¿ á»©ng dá»¥ng desktop/service in. TrÆ°á»›c khi gá»i API, mÃ¡y ngÆ°á»i dÃ¹ng cáº§n cÃ i vÃ  má»Ÿ NemoPOS Printer Service. Máº·c Ä‘á»‹nh SDK gá»i service táº¡i:

```text
http://localhost:9000
```

## CÃ i Äáº·t

```bash
npm install @tpcoms/printer-sdk
```

Náº¿u Ä‘ang phÃ¡t triá»ƒn trá»±c tiáº¿p trong repo SDK:

```bash
npm install
npm run build
```

TrÃªn Windows, náº¿u PowerShell cháº·n `npm` vÃ¬ Execution Policy, dÃ¹ng:

```powershell
npm.cmd install
npm.cmd run build
```

## Khá»Ÿi Táº¡o

```ts
import { PrinterSDK } from '@tpcoms/printer-sdk';

const printer = new PrinterSDK();
```

Náº¿u Printer Service cháº¡y á»Ÿ URL khÃ¡c:

```ts
const printer = new PrinterSDK({
  baseUrl: 'http://localhost:9000',
});
```

Náº¿u mÃ´i trÆ°á»ng cháº¡y khÃ´ng cÃ³ `fetch` global, truyá»n `fetchImpl`:

```ts
const printer = new PrinterSDK({
  fetchImpl: customFetch,
});
```

## Luá»“ng Sá»­ Dá»¥ng Nhanh

```ts
import { PrinterSDK, PrinterSDKError } from '@tpcoms/printer-sdk';

const printer = new PrinterSDK();

try {
  await printer.health();

  const printers = await printer.getPrinters();
  const selectedPrinter = printers[0];

  await printer.testPrint(selectedPrinter.id);

  await printer.printKitchen(selectedPrinter.id, {
    language: 'vi',
    table: 'B05',
    orderId: 'ORD-001',
    orderNote: 'KhÃ¡ch cáº§n gáº¥p',
    items: [
      { name: 'Phá»Ÿ bÃ²', qty: 2, note: 'KhÃ´ng hÃ nh' },
      { name: 'TrÃ  Ä‘Ã¡', qty: 1 },
    ],
  });
} catch (error) {
  if (error instanceof PrinterSDKError) {
    console.error(error.message);
  } else {
    console.error(error);
  }
}
```

## API Chung

### `health()`

Kiá»ƒm tra Printer Service cÃ³ Ä‘ang cháº¡y khÃ´ng.

```ts
const health = await printer.health();
```

Káº¿t quáº£:

```ts
{
  success: boolean;
  version: string;
  status: string;
}
```

### `getPrinters()`

Láº¥y danh sÃ¡ch mÃ¡y in service nháº­n diá»‡n Ä‘Æ°á»£c, gá»“m mÃ¡y in Windows/USB vÃ  LAN alias Ä‘Ã£ lÆ°u trong file cáº¥u hÃ¬nh.

```ts
const printers = await printer.getPrinters();
```

Káº¿t quáº£:

```ts
Array<{
  id: string;
  name: string;
  status?: string;
  type?: string;
  ip?: string;
  port?: string | number;
  categoryIds?: string[];
}>
```

Vá»›i mÃ¡y in LAN Ä‘Ã£ lÆ°u, response cÃ³ thá»ƒ cÃ³ thÃªm `ip` vÃ  `port`:

```ts
{
  id: 'kitchen-01',
  name: 'MÃ¡y in báº¿p',
  type: 'NETWORK',
  status: 'unknown',
  ip: '192.168.100.100',
  port: 9100,
}
```

## API MÃ¡y In LAN

### `discoverLanPrinters(options?)`

QuÃ©t máº¡ng LAN Ä‘á»ƒ tÃ¬m thiáº¿t bá»‹ Ä‘ang má»Ÿ port in, thÆ°á»ng lÃ  `9100`.

```ts
const result = await printer.discoverLanPrinters();
```

CÃ³ thá»ƒ truyá»n subnet thá»§ cÃ´ng náº¿u khÃ´ng muá»‘n service tá»± chá»n card máº¡ng:

```ts
const result = await printer.discoverLanPrinters({
  subnetIp: '192.168.100.179',
  netmask: '255.255.255.0',
  concurrency: 80,
  timeoutMs: 600,
});
```

Tham sá»‘:

| TÃªn | Kiá»ƒu | Báº¯t buá»™c | MÃ´ táº£ |
| --- | --- | --- | --- |
| `subnetIp` | `string` | KhÃ´ng | IP máº«u trong máº¡ng cáº§n quÃ©t. Náº¿u bá» trá»‘ng, service tá»± láº¥y máº¡ng cá»§a mÃ¡y Ä‘ang cháº¡y. |
| `netmask` | `string` | KhÃ´ng | Quy Ä‘á»‹nh dáº£i máº¡ng cáº§n quÃ©t, vÃ­ dá»¥ `255.255.255.0` lÃ  quÃ©t `x.x.x.1` Ä‘áº¿n `x.x.x.254`. |
| `concurrency` | `number` | KhÃ´ng | Sá»‘ IP Ä‘Æ°á»£c quÃ©t song song. |
| `timeoutMs` | `number` | KhÃ´ng | Thá»i gian chá» má»—i IP/port, tÃ­nh báº±ng mili giÃ¢y. |

Káº¿t quáº£:

```ts
{
  success: true;
  subnetIp: string;
  netmask: string;
  ports: number[];
  scannedHosts: number;
  total: number;
  printers: Array<{
    ip: string;
    port: number;
    printPorts: number[];
    openPorts: number[];
    confidence: 'high' | 'maybe';
    name: string;
    hostname?: string;
  }>;
}
```

VÃ­ dá»¥:

```ts
const discovered = await printer.discoverLanPrinters();

for (const item of discovered.printers) {
  console.log(item.ip, item.port, item.name);
}
```

### `testLanPrinter(payload)`

Gá»­i lá»‡nh in thá»­ trá»±c tiáº¿p tá»›i má»™t IP/port LAN. API nÃ y khÃ´ng lÆ°u cáº¥u hÃ¬nh.

```ts
await printer.testLanPrinter({
  host: '192.168.100.100',
  port: 9100,
});
```

Payload:

```ts
{
  host: string;
  port?: number;
}
```

Náº¿u khÃ´ng truyá»n `port`, service dÃ¹ng máº·c Ä‘á»‹nh `9100`.

### `saveLanPrinter(payload)`

LÆ°u hoáº·c cáº­p nháº­t alias mÃ¡y in LAN vÃ o file cáº¥u hÃ¬nh `printers.json`.

```ts
const saved = await printer.saveLanPrinter({
  id: 'kitchen-01',
  name: 'MÃ¡y in báº¿p',
  host: '192.168.100.100',
  port: 9100,
});
```

Payload:

```ts
{
  id: string;
  name: string;
  host: string;
  port?: number;
}
```

Káº¿t quáº£:

```ts
{
  success: true;
  message: string;
  printer: {
    id: string;
    name: string;
    enabled: boolean;
    connection: {
      type: 'tcp';
      host: string;
      port?: number;
    };
  };
}
```

### `updatePrinterCategories(id, payload)`

Cap nhat danh muc san pham ma may in phu trach. Co the truyen object hoac mang string truc tiep.

```ts
await printer.updatePrinterCategories('kitchen-01', {
  categoryIds: ['mon-bep', 'mon-nuong'],
});

await printer.updatePrinterCategories('bar-01', ['do-uong']);
```

API nay goi endpoint:

```text
PATCH /api/printers/:id/categories
```

Payload:

```ts
{
  categoryIds: string[];
}
```

`saveLanPrinter(payload)` cung co the nhan luon `categoryIds`:

```ts
await printer.saveLanPrinter({
  id: 'kitchen-01',
  name: 'May in bep',
  host: '192.168.100.100',
  port: 9100,
  categoryIds: ['mon-bep'],
});
```
### `renameLanPrinter(id, payload)`

Äá»•i tÃªn mÃ¡y in LAN Ä‘Ã£ lÆ°u trong `printers.json`.

CÃ³ thá»ƒ truyá»n tÃªn trá»±c tiáº¿p:

```ts
await printer.renameLanPrinter('kitchen-01', 'MÃ¡y in báº¿p táº§ng 1');
```

Hoáº·c truyá»n object:

```ts
await printer.renameLanPrinter('kitchen-01', {
  name: 'MÃ¡y in báº¿p táº§ng 1',
});
```

API nÃ y chá»‰ Ä‘á»•i `name`, khÃ´ng Ä‘á»•i `host`, `port`, `id` hoáº·c cÃ¡c field khÃ¡c.

### `deleteLanPrinter(id)`

XÃ³a mÃ¡y in LAN Ä‘Ã£ lÆ°u khá»i `printers.json`.

```ts
await printer.deleteLanPrinter('kitchen-01');
```

API nÃ y chá»‰ xÃ³a LAN alias cÃ³ `connection.type = 'tcp'`. MÃ¡y in Windows/USB khÃ´ng bá»‹ áº£nh hÆ°á»Ÿng.

## API In

### `testPrint(printerId)`

In thá»­ trÃªn má»™t mÃ¡y in Ä‘Ã£ biáº¿t. `printerId` lÃ  `id` hoáº·c `name` láº¥y tá»« `getPrinters()`.

```ts
await printer.testPrint('kitchen-01');
```

### `print(payload)`

API in tá»•ng quÃ¡t.

```ts
await printer.print({
  printer: 'kitchen-01',
  template: 'receipt',
  data: {
    storeName: 'Nemo Restaurant',
    orderId: 'ORD-001',
    items: [
      { name: 'Phá»Ÿ bÃ²', qty: 1, price: 50000 },
      { name: 'TrÃ  Ä‘Ã¡', qty: 2, price: 5000 },
    ],
    total: 60000,
  },
});
```

Payload phá»• biáº¿n:

```ts
{
  printer: string;
  template: 'receipt' | 'kitchen' | 'bill' | 'label';
  data: unknown;
}
```

### `printInvoice(payload)`

In hÃ³a Ä‘Æ¡n dáº¡ng payload top-level, phÃ¹ há»£p khi FE Ä‘Ã£ cÃ³ cáº¥u trÃºc invoice/header/items/summary/payment.

```ts
await printer.printInvoice({
  printer: 'kitchen-01',
  template: 'receipt',
  header: {
    store_name: 'Cá»­a hÃ ng test',
    address: '269 Nguyá»…n VÄƒn HuyÃªn',
    phone: '0123456789',
  },
  invoice: {
    title: 'HÃ“A ÄÆ N BÃN HÃ€NG',
    code: 'SAL-001',
    customer: 'KhÃ¡ch láº»',
  },
  items: [
    {
      name: 'Cáº£i bÃ³ xÃ´i',
      quantity: 1,
      unit_price: 62000,
      amount: 62000,
    },
  ],
  summary: {
    subtotal: 62000,
    total: 62000,
  },
  payment: {
    method: 'cash',
    amount: 62000,
  },
});
```

### `printReceipt(printerId, data)`

```ts
await printer.printReceipt('kitchen-01', {
  storeName: 'Nemo Restaurant',
  orderId: 'ORD-001',
  items: [
    { name: 'Phá»Ÿ bÃ²', qty: 1, price: 50000 },
    { name: 'TrÃ  Ä‘Ã¡', qty: 2, price: 5000 },
  ],
  total: 60000,
  note: 'Cáº£m Æ¡n quÃ½ khÃ¡ch',
});
```

### `printKitchenByCategory(categoryId, data)`

In phieu bep theo mot danh muc. Service se tim may in enabled co `categoryIds` chua `categoryId`.

```ts
await printer.printKitchenByCategory('mon-bep', {
  language: 'vi',
  table: 'B05',
  orderId: 'ORD-001',
  items: [
    { name: 'Pho bo', qty: 2, note: 'Khong hanh' },
  ],
});
```

### `printKitchenByItemCategories(data)`

In phieu bep va de service tach mon theo `items[].categoryId`. Neu don co nhieu danh muc, service co the tao nhieu job in, moi job di toi may in tuong ung.

```ts
await printer.printKitchenByItemCategories({
  language: 'vi',
  table: 'B05',
  orderId: 'ORD-001',
  items: [
    { categoryId: 'mon-bep', name: 'Pho bo', qty: 2 },
    { categoryId: 'do-uong', name: 'Tra da', qty: 1 },
  ],
});
```

Response cua `print()` co the la mot job hoac nhieu job:

```ts
type PrintResponse =
  | { success: true; message: string; job: PrintJob }
  | { success: true; message: string; jobs: PrintJob[] };
```
### `printKitchen(printerId, data)`

```ts
await printer.printKitchen('kitchen-01', {
  language: 'vi',
  table: 'B05',
  orderId: 'ORD-001',
  orderNote: 'KhÃ¡ch cáº§n gáº¥p',
  items: [
    { name: 'Phá»Ÿ bÃ²', qty: 2, note: 'KhÃ´ng hÃ nh' },
    { name: 'TrÃ  Ä‘Ã¡', qty: 1 },
  ],
});
```

### `printBill(printerId, data)`

```ts
await printer.printBill('kitchen-01', {
  storeName: 'Nemo Restaurant',
  table: 'B05',
  items: [
    { name: 'Phá»Ÿ bÃ²', qty: 1, price: 50000 },
    { name: 'TrÃ  Ä‘Ã¡', qty: 2, price: 5000 },
  ],
  total: 60000,
  discount: 5000,
  tax: 0,
  finalTotal: 55000,
});
```

### `printLabel(printerId, data)`

```ts
await printer.printLabel('kitchen-01', {
  productName: 'CÃ  phÃª sá»¯a Ä‘Ã¡',
  price: 29000,
  barcode: '8930000000012',
  note: 'Ãt Ä‘Ã¡',
});
```

## API Queue

### `getQueue()`

Láº¥y danh sÃ¡ch job in trong hÃ ng Ä‘á»£i.

```ts
const queue = await printer.getQueue();
```

### `getFailedQueue()`

Láº¥y danh sÃ¡ch job in Ä‘Ã£ lá»—i sau khi retry háº¿t sá»‘ láº§n cho phÃ©p.

```ts
const failedJobs = await printer.getFailedQueue();
```

Job lá»—i cÃ³ thá»ƒ chá»©a payload gá»‘c Ä‘á»ƒ FE hiá»ƒn thá»‹ láº¡i ná»™i dung bill/mÃ³n bá»‹ lá»—i:

```ts
Array<{
  id: number;
  status: 'failed';
  printer: string;
  printerName: string;
  template: string;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  data?: unknown;
  payload?: unknown;
}>
```

### `retryQueue(payload?)`

Retry toÃ n bá»™ job lá»—i:

```ts
await printer.retryQueue();
```

Retry má»™t job cá»¥ thá»ƒ:

```ts
await printer.retryQueue({ id: 5 });
```

Hoáº·c:

```ts
await printer.retryQueue({ jobId: 5 });
```

### `clearQueue()`

XÃ³a cÃ¡c job trong queue theo logic cá»§a service.

```ts
const result = await printer.clearQueue();
```

Káº¿t quáº£:

```ts
{
  success: true;
  removed: number;
}
```

## Xá»­ LÃ½ Lá»—i Cho FE

Táº¥t cáº£ method trong SDK cÃ³ thá»ƒ throw `PrinterSDKError`.

CÃ³ 2 nhÃ³m lá»—i chÃ­nh:

1. Service Ä‘ang cháº¡y nhÆ°ng API tráº£ HTTP lá»—i, vÃ­ dá»¥ sai `printerId`, thiáº¿u field, khÃ´ng tÃ¬m tháº¥y LAN alias.
2. Service khÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c, vÃ­ dá»¥ app in chÆ°a má»Ÿ hoáº·c port `9000` chÆ°a listen.

VÃ­ dá»¥ báº¯t lá»—i chuáº©n á»Ÿ FE:

```ts
import { PrinterSDK, PrinterSDKError } from '@tpcoms/printer-sdk';

const printer = new PrinterSDK();

try {
  const printers = await printer.getPrinters();
  console.log(printers);
} catch (error) {
  if (error instanceof PrinterSDKError) {
    showToast(error.message);
    return;
  }

  showToast('CÃ³ lá»—i khÃ´ng xÃ¡c Ä‘á»‹nh khi káº¿t ná»‘i mÃ¡y in');
}
```

Khi service chÆ°a cháº¡y, SDK sáº½ throw message:

```text
Khong ket noi duoc Printer Service. Vui long mo lai ung dung in.
```

FE nÃªn hiá»ƒn thá»‹ message nÃ y báº±ng toast/modal/snackbar tÃ¹y UI cá»§a dá»± Ã¡n. SDK khÃ´ng tá»± `alert`, vÃ¬ SDK khÃ´ng biáº¿t FE Ä‘ang dÃ¹ng React, Vue, Angular, mobile web hay POS desktop.

CÃ¡c thÃ´ng tin lá»—i cÃ³ sáºµn:

```ts
try {
  await printer.testPrint('unknown-printer');
} catch (error) {
  if (error instanceof PrinterSDKError) {
    console.log(error.message); // message thÃ¢n thiá»‡n
    console.log(error.status);  // HTTP status náº¿u cÃ³
    console.log(error.details); // response body hoáº·c lá»—i gá»‘c
  }
}
```

## Thá»© Tá»± Gá»i API Äá» Xuáº¥t

### In báº±ng mÃ¡y in Ä‘Ã£ cÃ³

```ts
const printer = new PrinterSDK();

await printer.health();

const printers = await printer.getPrinters();
const selectedPrinter = printers.find((item) => item.status === 'online') ?? printers[0];

await printer.testPrint(selectedPrinter.id);

await printer.printKitchen(selectedPrinter.id, {
  language: 'vi',
  table: 'B05',
  items: [{ name: 'Phá»Ÿ bÃ²', qty: 1 }],
});
```

### ThÃªm mÃ¡y in LAN má»›i

```ts
const discovery = await printer.discoverLanPrinters();
const target = discovery.printers[0];

await printer.testLanPrinter({
  host: target.ip,
  port: target.port,
});

await printer.saveLanPrinter({
  id: 'kitchen-01',
  name: 'MÃ¡y in báº¿p',
  host: target.ip,
  port: target.port,
});
```

### Äá»•i tÃªn hoáº·c xÃ³a mÃ¡y in LAN Ä‘Ã£ lÆ°u

```ts
await printer.renameLanPrinter('kitchen-01', 'MÃ¡y in báº¿p táº§ng 1');
await printer.deleteLanPrinter('kitchen-01');
```

## Publish LÃªn Npm

Package hiá»‡n dÃ¹ng scope:

```text
@tpcoms/printer-sdk
```

TrÆ°á»›c khi publish:

```bash
npm login
npm whoami
npm run build
npm publish --access public
```

TrÃªn Windows:

```powershell
npm.cmd run build
npm.cmd publish --access public
```
