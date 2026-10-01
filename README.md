# @tpcoms/printer-sdk

TypeScript SDK de goi Printer Service dang chay tren may local cua nguoi dung.

SDK nay khong thay the app desktop/service in. Truoc khi FE goi SDK, may nguoi dung can cai va mo Printer Service. Mac dinh SDK goi service tai:

```text
http://localhost:9000
```

## Cai Dat

```bash
npm install @tpcoms/printer-sdk
```

Neu dang phat trien truc tiep trong repo SDK:

```bash
npm install
npm run build
```

Tren Windows, neu PowerShell chan `npm` vi Execution Policy, dung:

```powershell
npm.cmd install
npm.cmd run build
```

## Khoi Tao

```ts
import { PrinterSDK } from '@tpcoms/printer-sdk';

const printer = new PrinterSDK();
```

Neu Printer Service chay o URL khac:

```ts
const printer = new PrinterSDK({
  baseUrl: 'http://localhost:9000',
});
```

Neu moi truong khong co `fetch` global, truyen `fetchImpl`:

```ts
const printer = new PrinterSDK({
  fetchImpl: customFetch,
});
```

## Luong Su Dung Nhanh

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
    orderNote: 'Khach can gap',
    items: [
      { name: 'Pho bo', qty: 2, note: 'Khong hanh' },
      { name: 'Tra da', qty: 1 },
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

Kiem tra Printer Service co dang chay khong.

```ts
const health = await printer.health();
```

Ket qua:

```ts
{
  success: boolean;
  version: string;
  status: string;
}
```

### `getPrinters()`

Lay danh sach may in service nhan dien duoc, gom Windows/USB printers va LAN printers da luu trong config.

```ts
const printers = await printer.getPrinters();
```

Ket qua:

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

Voi may in LAN da cau hinh category, response co dang:

```ts
{
  id: 'kitchen-01',
  name: 'May in bep',
  type: 'NETWORK',
  status: 'unknown',
  ip: '192.168.100.100',
  port: 9100,
  categoryIds: ['mon-bep'],
}
```

## API May In LAN

### `discoverLanPrinters(options?)`

Quet mang LAN de tim thiet bi dang mo port in, thuong la `9100`.

```ts
const result = await printer.discoverLanPrinters();
```

Co the truyen network thu cong:

```ts
const result = await printer.discoverLanPrinters({
  subnetIp: '192.168.100.179',
  netmask: '255.255.255.0',
  concurrency: 80,
  timeoutMs: 600,
});
```

Options:

| Ten | Kieu | Bat buoc | Mo ta |
| --- | --- | --- | --- |
| `subnetIp` | `string` | Khong | IP mau trong mang can quet. Neu bo trong, service tu chon mang cua may dang chay. |
| `netmask` | `string` | Khong | Netmask cua mang can quet, vi du `255.255.255.0`. |
| `concurrency` | `number` | Khong | So IP duoc quet song song. |
| `timeoutMs` | `number` | Khong | Thoi gian cho moi IP/port, tinh bang milliseconds. |

Ket qua:

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

### `testLanPrinter(payload)`

Gui lenh in thu truc tiep toi mot IP/port LAN. API nay khong luu config.

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

Neu khong truyen `port`, service dung mac dinh `9100`.

### `saveLanPrinter(payload)`

Luu hoac cap nhat may in LAN vao config. Co the gan luon danh muc san pham ma may in phu trach bang `categoryIds`.

```ts
await printer.saveLanPrinter({
  id: 'kitchen-01',
  name: 'May in bep',
  host: '192.168.100.100',
  port: 9100,
  categoryIds: ['mon-bep'],
});
```

Payload:

```ts
{
  id: string;
  name: string;
  host: string;
  port?: number;
  categoryIds?: string[];
}
```

Neu `categoryIds` khong duoc truyen khi update printer da ton tai, service se giu category hien co.

Ket qua:

```ts
{
  success: true;
  message: string;
  printer: {
    id: string;
    name: string;
    enabled: boolean;
    categoryIds: string[];
    connection: {
      type: 'tcp';
      host: string;
      port?: number;
    };
  };
}
```

### `updatePrinterCategories(id, payload)`

Cap nhat danh muc san pham ma mot may in phu trach.

Co the truyen object:

```ts
await printer.updatePrinterCategories('kitchen-01', {
  categoryIds: ['mon-bep', 'mon-nuong'],
});
```

Hoac truyen mang string truc tiep:

```ts
await printer.updatePrinterCategories('bar-01', ['do-uong']);
```

Endpoint service tuong ung:

```text
PATCH /api/printers/:id/categories
```

Payload:

```ts
{
  categoryIds: string[];
}
```

### `renameLanPrinter(id, payload)`

Doi ten may in LAN da luu trong config.

```ts
await printer.renameLanPrinter('kitchen-01', 'May in bep tang 1');
```

Hoac:

```ts
await printer.renameLanPrinter('kitchen-01', {
  name: 'May in bep tang 1',
});
```

API nay chi doi `name`, khong doi `host`, `port`, `id` hoac `categoryIds`.

### `deleteLanPrinter(id)`

Xoa may in LAN da luu khoi config.

```ts
await printer.deleteLanPrinter('kitchen-01');
```

API nay chi xoa LAN alias co `connection.type = 'tcp'`. May in Windows/USB khong bi anh huong.

## API In

### `testPrint(printerId)`

In thu tren mot may in da biet. `printerId` la `id` hoac `name` lay tu `getPrinters()`.

```ts
await printer.testPrint('kitchen-01');
```

### `print(payload)`

API in tong quat. Co 3 cach route job:

1. In truc tiep bang `printer`.
2. In theo `categoryId` top-level.
3. In va de service tach mon theo `data.items[].categoryId`.

#### In truc tiep bang printer

```ts
await printer.print({
  printer: 'kitchen-01',
  template: 'receipt',
  data: {
    storeName: 'Nemo Restaurant',
    orderId: 'ORD-001',
    items: [
      { name: 'Pho bo', qty: 1, price: 50000 },
      { name: 'Tra da', qty: 2, price: 5000 },
    ],
    total: 60000,
  },
});
```

#### In theo mot category

```ts
await printer.print({
  categoryId: 'mon-bep',
  template: 'kitchen',
  data: {
    table: 'B05',
    orderId: 'ORD-001',
    items: [
      { name: 'Pho bo', qty: 2 },
    ],
  },
});
```

Service se tim may in enabled co `categoryIds` chua `mon-bep`.

#### In va tach job theo category cua tung item

```ts
await printer.print({
  template: 'kitchen',
  data: {
    table: 'B05',
    orderId: 'ORD-001',
    items: [
      { categoryId: 'mon-bep', name: 'Pho bo', qty: 2 },
      { categoryId: 'do-uong', name: 'Tra da', qty: 1 },
    ],
  },
});
```

Service se group items theo category, resolve may in tu `printers[].categoryIds`, va tao nhieu job neu can.

Response cua `print()` co the la 1 job hoac nhieu job:

```ts
type PrintResponse =
  | { success: true; message: string; job: PrintJob }
  | { success: true; message: string; jobs: PrintJob[] };
```

### `printInvoice(payload)`

In hoa don dang payload top-level, phu hop khi FE da co cau truc invoice/header/items/summary/payment.

```ts
await printer.printInvoice({
  printer: 'kitchen-01',
  template: 'receipt',
  header: {
    store_name: 'Cua hang test',
    address: '269 Nguyen Van Huyen',
    phone: '0123456789',
  },
  invoice: {
    title: 'HOA DON BAN HANG',
    code: 'SAL-001',
    customer: 'Khach le',
  },
  items: [
    {
      name: 'Cai bo xoi',
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
    { name: 'Pho bo', qty: 1, price: 50000 },
    { name: 'Tra da', qty: 2, price: 5000 },
  ],
  total: 60000,
  note: 'Cam on quy khach',
});
```

### `printKitchen(printerId, data)`

In phieu bep truc tiep bang printer id.

```ts
await printer.printKitchen('kitchen-01', {
  language: 'vi',
  table: 'B05',
  orderId: 'ORD-001',
  orderNote: 'Khach can gap',
  items: [
    { name: 'Pho bo', qty: 2, note: 'Khong hanh' },
    { name: 'Tra da', qty: 1 },
  ],
});
```

### `printKitchenByCategory(categoryId, data)`

In phieu bep theo mot danh muc. Service se tim may in enabled co `categoryIds` chua category do.

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

In phieu bep va de service tach mon theo `items[].categoryId`.

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

### `printBill(printerId, data)`

```ts
await printer.printBill('kitchen-01', {
  storeName: 'Nemo Restaurant',
  table: 'B05',
  items: [
    { name: 'Pho bo', qty: 1, price: 50000 },
    { name: 'Tra da', qty: 2, price: 5000 },
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
  productName: 'Ca phe sua da',
  price: 29000,
  barcode: '8930000000012',
  note: 'It da',
});
```

## API Queue

### `getQueue()`

Lay danh sach job in trong hang doi.

```ts
const queue = await printer.getQueue();
```

Job co the co `categoryId` neu duoc route theo category.

```ts
Array<{
  id: number;
  status: 'waiting' | 'printing' | 'spooled' | 'completed' | 'failed';
  printer: string;
  printerName: string;
  template: string;
  categoryId?: string;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  spoolerJobId?: number;
}>
```

### `getFailedQueue()`

Lay danh sach job in da loi sau khi retry het so lan cho phep.

```ts
const failedJobs = await printer.getFailedQueue();
```

Job loi co the chua payload goc de FE hien thi lai noi dung bill/mon bi loi:

```ts
Array<{
  id: number;
  status: 'failed';
  printer: string;
  printerName: string;
  template: string;
  categoryId?: string;
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  data?: unknown;
  payload?: unknown;
}>
```

### `retryQueue(payload?)`

Retry toan bo job loi:

```ts
await printer.retryQueue();
```

Retry mot job cu the:

```ts
await printer.retryQueue({ id: 5 });
```

Hoac:

```ts
await printer.retryQueue({ jobId: 5 });
```

### `clearQueue()`

Xoa cac job trong queue theo logic cua service.

```ts
const result = await printer.clearQueue();
```

Ket qua:

```ts
{
  success: true;
  removed: number;
}
```

## Xu Ly Loi Cho FE

Tat ca method trong SDK co the throw `PrinterSDKError`.

Co 2 nhom loi chinh:

1. Service dang chay nhung API tra HTTP loi, vi du sai `printerId`, thieu field, category chua cau hinh may in.
2. Service khong ket noi duoc, vi du app in chua mo hoac port `9000` chua listen.

Vi du bat loi chuan o FE:

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

  showToast('Co loi khong xac dinh khi ket noi may in');
}
```

Khi service chua chay, SDK se throw message:

```text
Khong ket noi duoc Printer Service. Vui long mo lai ung dung in.
```

Thong tin loi co san:

```ts
try {
  await printer.printKitchenByCategory('chua-cau-hinh', {
    table: 'B05',
    items: [{ name: 'Pho bo', qty: 1 }],
  });
} catch (error) {
  if (error instanceof PrinterSDKError) {
    console.log(error.message); // vi du: Danh muc chua cau hinh may in: chua-cau-hinh
    console.log(error.status);  // HTTP status neu co
    console.log(error.details); // response body hoac loi goc
  }
}
```

## Thu Tu Goi API De Xuat

### In bang may in da co

```ts
const printer = new PrinterSDK();

await printer.health();

const printers = await printer.getPrinters();
const selectedPrinter = printers.find((item) => item.status === 'online') ?? printers[0];

await printer.testPrint(selectedPrinter.id);

await printer.printKitchen(selectedPrinter.id, {
  language: 'vi',
  table: 'B05',
  items: [{ name: 'Pho bo', qty: 1 }],
});
```

### Them may in LAN va gan category

```ts
const discovery = await printer.discoverLanPrinters();
const target = discovery.printers[0];

await printer.testLanPrinter({
  host: target.ip,
  port: target.port,
});

await printer.saveLanPrinter({
  id: 'kitchen-01',
  name: 'May in bep',
  host: target.ip,
  port: target.port,
  categoryIds: ['mon-bep'],
});
```

### Tach job in bep theo category cua mon

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

### Doi ten hoac xoa may in LAN da luu

```ts
await printer.renameLanPrinter('kitchen-01', 'May in bep tang 1');
await printer.deleteLanPrinter('kitchen-01');
```

## Publish Len Npm

Package hien dung scope:

```text
@tpcoms/printer-sdk
```

Truoc khi publish:

```bash
npm login
npm whoami
npm run build
npm publish --access public
```

Tren Windows:

```powershell
npm.cmd run build
npm.cmd publish --access public
```
