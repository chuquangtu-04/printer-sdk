# @nemoprint/printer-sdk

SDK TypeScript dùng để gọi **NemoPOS Printer Service** đang chạy trên máy local.

SDK này không thay thế ứng dụng desktop/service in. Trước khi gọi API, máy người dùng cần cài và mở NemoPOS Printer Service. Mặc định SDK gọi service tại:

```text
http://localhost:9000
```

## Cài Đặt

Sau khi package đã được publish lên npm:

```bash
npm install @nemoprint/printer-sdk
```

Nếu đang phát triển trực tiếp trong repo này:

```bash
npm install
npm run build
```

Trên Windows, nếu PowerShell chặn `npm` vì Execution Policy, dùng:

```powershell
npm.cmd install
npm.cmd run build
```

## Publish Lên Npm

Package hiện dùng scope npm:

```text
@nemoprint/printer-sdk
```

Trước khi publish, đăng nhập npm:

```bash
npm login
npm whoami
```

Build và publish:

```bash
npm run build
npm publish --access public
```

Trên Windows có thể dùng:

```powershell
npm.cmd run build
npm.cmd publish --access public
```

Sau khi publish thành công, dự án khác có thể cài bằng:

```bash
npm install @nemoprint/printer-sdk
```

## Khởi Tạo SDK

```ts
import { PrinterSDK } from '@nemoprint/printer-sdk';

const printer = new PrinterSDK();
```

Nếu service chạy ở URL khác:

```ts
const printer = new PrinterSDK({
  baseUrl: 'http://localhost:9000',
});
```

Nếu môi trường chạy không có `fetch` global, truyền `fetchImpl`:

```ts
const printer = new PrinterSDK({
  fetchImpl: customFetch,
});
```

## Ví Dụ Sử Dụng Nhanh

```ts
import { PrinterSDK } from '@nemoprint/printer-sdk';

const printer = new PrinterSDK();

const health = await printer.health();
console.log(health);

const printers = await printer.getPrinters();
const printerId = printers[0].id;

await printer.printKitchen(printerId, {
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

## Danh Sách API

### `health()`

Kiểm tra NemoPOS Printer Service có đang chạy không.

```ts
const health = await printer.health();
```

Kết quả:

```ts
{
  success: boolean;
  version: string;
  status: string;
}
```

### `getPrinters()`

Lấy danh sách máy in mà service nhận diện được.

```ts
const printers = await printer.getPrinters();
```

Kết quả:

```ts
Array<{
  id: string;
  name: string;
  status?: string;
  type?: string;
  port?: string;
}>
```

### `testPrint(printerId)`

In thử trên một máy in cụ thể.

```ts
const printers = await printer.getPrinters();
await printer.testPrint(printers[0].id);
```

Tham số:

| Tên | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `printerId` | `string` | Có | ID máy in lấy từ `getPrinters()` |

### `print(payload)`

API in tổng quát. Dùng khi bạn muốn tự truyền `template` và `data`.

```ts
await printer.print({
  printer: printerId,
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

Payload:

```ts
{
  printer: string;
  template: 'receipt' | 'kitchen' | 'bill' | 'label';
  data: unknown;
}
```

### `printReceipt(printerId, data)`

In hóa đơn/biên nhận.

```ts
await printer.printReceipt(printerId, {
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

`ReceiptData`:

```ts
{
  storeName?: string;
  orderId?: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  total?: number;
  note?: string;
}
```

### `printKitchen(printerId, data)`

In phiếu bếp.

```ts
await printer.printKitchen(printerId, {
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

`KitchenData`:

```ts
{
  language?: 'vi' | 'en';
  orderId?: string;
  billId?: string;
  table?: string;
  note?: string;
  orderNote?: string;
  items: Array<{
    name: string;
    qty: number;
    note?: string;
  }>;
}
```

### `printBill(printerId, data)`

In bill thanh toán.

```ts
await printer.printBill(printerId, {
  storeName: 'Nemo Restaurant',
  table: '208',
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

`BillData`:

```ts
{
  storeName?: string;
  table?: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
  }>;
  total?: number;
  discount?: number;
  tax?: number;
  finalTotal?: number;
}
```

### `printLabel(printerId, data)`

In tem/nhãn sản phẩm.

```ts
await printer.printLabel(printerId, {
  productName: 'Ca phe sua da',
  price: 29000,
  barcode: '8930000000012',
  note: 'It da',
});
```

`LabelData`:

```ts
{
  productName: string;
  price?: number;
  barcode?: string;
  note?: string;
}
```

### `getQueue()`

Lấy danh sách job in trong hàng đợi.

```ts
const queue = await printer.getQueue();
```

Kết quả:

```ts
Array<{
  id: number;
  status: 'waiting' | 'printing' | 'completed' | 'failed';
  printer: string;
  printerName: string;
  template: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  lastError?: string;
}>
```

### `retryQueue(payload?)`

Chạy lại job in bị lỗi.

```ts
await printer.retryQueue();
await printer.retryQueue({ id: 5 });
```

Payload:

```ts
{
  id?: number;
}
```

### `clearQueue()`

Xóa hàng đợi in.

```ts
const result = await printer.clearQueue();
```

Kết quả:

```ts
{
  success: true;
  removed: number;
}
```

## Kết Quả Khi In Thành Công

Các API in như `print`, `printReceipt`, `printKitchen`, `printBill`, `printLabel` trả về:

```ts
{
  success: true;
  message: string;
  job: {
    id: number;
    status: 'waiting' | 'printing' | 'completed' | 'failed';
    printer: string;
    printerName: string;
    template: string;
    attempts: number;
    maxAttempts: number;
    createdAt: string;
    updatedAt: string;
    startedAt?: string;
    completedAt?: string;
    lastError?: string;
  };
}
```

## Xử Lý Lỗi

SDK sẽ throw `PrinterSDKError` nếu service trả lỗi HTTP hoặc không xử lý được request.

```ts
import { PrinterSDK, PrinterSDKError } from '@nemoprint/printer-sdk';

const printer = new PrinterSDK();

try {
  await printer.testPrint('printer-id');
} catch (error) {
  if (error instanceof PrinterSDKError) {
    console.error(error.message);
    console.error(error.status);
    console.error(error.details);
  } else {
    console.error(error);
  }
}
```

Các lỗi thường gặp:

| Tình huống | Cách kiểm tra |
| --- | --- |
| Service chưa chạy | Gọi `printer.health()` hoặc mở `http://localhost:9000/api/health` |
| Máy in offline | Gọi `printer.getPrinters()` và kiểm tra `status` |
| Sai `printerId` | Lấy lại ID mới nhất từ `getPrinters()` |
| Job in lỗi | Gọi `getQueue()`, xem `lastError`, sau đó dùng `retryQueue()` |

## Thứ Tự Gọi API Đề Xuất

```ts
const printer = new PrinterSDK();

await printer.health();

const printers = await printer.getPrinters();
const selectedPrinter = printers.find((item) => item.status === 'online') ?? printers[0];

await printer.testPrint(selectedPrinter.id);

await printer.printKitchen(selectedPrinter.id, {
  language: 'vi',
  table: '208',
  items: [{ name: 'Pho bo', qty: 1 }],
});
```
