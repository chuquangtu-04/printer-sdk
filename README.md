# @nemoprint/printer-sdk

SDK TypeScript dùng để gọi **NemoPOS Printer Service** đang chạy trên máy local của người dùng.

SDK này không thay thế ứng dụng desktop/service in. Trước khi gọi API, máy người dùng cần cài và mở NemoPOS Printer Service. Mặc định SDK gọi service tại:

```text
http://localhost:9000
```

## Cài Đặt

```bash
npm install @nemoprint/printer-sdk
```

Nếu đang phát triển trực tiếp trong repo SDK:

```bash
npm install
npm run build
```

Trên Windows, nếu PowerShell chặn `npm` vì Execution Policy, dùng:

```powershell
npm.cmd install
npm.cmd run build
```

## Khởi Tạo

```ts
import { PrinterSDK } from '@nemoprint/printer-sdk';

const printer = new PrinterSDK();
```

Nếu Printer Service chạy ở URL khác:

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

## Luồng Sử Dụng Nhanh

```ts
import { PrinterSDK, PrinterSDKError } from '@nemoprint/printer-sdk';

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
    orderNote: 'Khách cần gấp',
    items: [
      { name: 'Phở bò', qty: 2, note: 'Không hành' },
      { name: 'Trà đá', qty: 1 },
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

Kiểm tra Printer Service có đang chạy không.

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

Lấy danh sách máy in service nhận diện được, gồm máy in Windows/USB và LAN alias đã lưu trong file cấu hình.

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
  ip?: string;
  port?: string | number;
}>
```

Với máy in LAN đã lưu, response có thể có thêm `ip` và `port`:

```ts
{
  id: 'kitchen-01',
  name: 'Máy in bếp',
  type: 'NETWORK',
  status: 'unknown',
  ip: '192.168.100.100',
  port: 9100,
}
```

## API Máy In LAN

### `discoverLanPrinters(options?)`

Quét mạng LAN để tìm thiết bị đang mở port in, thường là `9100`.

```ts
const result = await printer.discoverLanPrinters();
```

Có thể truyền subnet thủ công nếu không muốn service tự chọn card mạng:

```ts
const result = await printer.discoverLanPrinters({
  subnetIp: '192.168.100.179',
  netmask: '255.255.255.0',
  concurrency: 80,
  timeoutMs: 600,
});
```

Tham số:

| Tên | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `subnetIp` | `string` | Không | IP mẫu trong mạng cần quét. Nếu bỏ trống, service tự lấy mạng của máy đang chạy. |
| `netmask` | `string` | Không | Quy định dải mạng cần quét, ví dụ `255.255.255.0` là quét `x.x.x.1` đến `x.x.x.254`. |
| `concurrency` | `number` | Không | Số IP được quét song song. |
| `timeoutMs` | `number` | Không | Thời gian chờ mỗi IP/port, tính bằng mili giây. |

Kết quả:

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

Ví dụ:

```ts
const discovered = await printer.discoverLanPrinters();

for (const item of discovered.printers) {
  console.log(item.ip, item.port, item.name);
}
```

### `testLanPrinter(payload)`

Gửi lệnh in thử trực tiếp tới một IP/port LAN. API này không lưu cấu hình.

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

Nếu không truyền `port`, service dùng mặc định `9100`.

### `saveLanPrinter(payload)`

Lưu hoặc cập nhật alias máy in LAN vào file cấu hình `printers.json`.

```ts
const saved = await printer.saveLanPrinter({
  id: 'kitchen-01',
  name: 'Máy in bếp',
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

Kết quả:

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

### `renameLanPrinter(id, payload)`

Đổi tên máy in LAN đã lưu trong `printers.json`.

Có thể truyền tên trực tiếp:

```ts
await printer.renameLanPrinter('kitchen-01', 'Máy in bếp tầng 1');
```

Hoặc truyền object:

```ts
await printer.renameLanPrinter('kitchen-01', {
  name: 'Máy in bếp tầng 1',
});
```

API này chỉ đổi `name`, không đổi `host`, `port`, `id` hoặc các field khác.

### `deleteLanPrinter(id)`

Xóa máy in LAN đã lưu khỏi `printers.json`.

```ts
await printer.deleteLanPrinter('kitchen-01');
```

API này chỉ xóa LAN alias có `connection.type = 'tcp'`. Máy in Windows/USB không bị ảnh hưởng.

## API In

### `testPrint(printerId)`

In thử trên một máy in đã biết. `printerId` là `id` hoặc `name` lấy từ `getPrinters()`.

```ts
await printer.testPrint('kitchen-01');
```

### `print(payload)`

API in tổng quát.

```ts
await printer.print({
  printer: 'kitchen-01',
  template: 'receipt',
  data: {
    storeName: 'Nemo Restaurant',
    orderId: 'ORD-001',
    items: [
      { name: 'Phở bò', qty: 1, price: 50000 },
      { name: 'Trà đá', qty: 2, price: 5000 },
    ],
    total: 60000,
  },
});
```

Payload phổ biến:

```ts
{
  printer: string;
  template: 'receipt' | 'kitchen' | 'bill' | 'label';
  data: unknown;
}
```

### `printInvoice(payload)`

In hóa đơn dạng payload top-level, phù hợp khi FE đã có cấu trúc invoice/header/items/summary/payment.

```ts
await printer.printInvoice({
  printer: 'kitchen-01',
  template: 'receipt',
  header: {
    store_name: 'Cửa hàng test',
    address: '269 Nguyễn Văn Huyên',
    phone: '0123456789',
  },
  invoice: {
    title: 'HÓA ĐƠN BÁN HÀNG',
    code: 'SAL-001',
    customer: 'Khách lẻ',
  },
  items: [
    {
      name: 'Cải bó xôi',
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
    { name: 'Phở bò', qty: 1, price: 50000 },
    { name: 'Trà đá', qty: 2, price: 5000 },
  ],
  total: 60000,
  note: 'Cảm ơn quý khách',
});
```

### `printKitchen(printerId, data)`

```ts
await printer.printKitchen('kitchen-01', {
  language: 'vi',
  table: 'B05',
  orderId: 'ORD-001',
  orderNote: 'Khách cần gấp',
  items: [
    { name: 'Phở bò', qty: 2, note: 'Không hành' },
    { name: 'Trà đá', qty: 1 },
  ],
});
```

### `printBill(printerId, data)`

```ts
await printer.printBill('kitchen-01', {
  storeName: 'Nemo Restaurant',
  table: 'B05',
  items: [
    { name: 'Phở bò', qty: 1, price: 50000 },
    { name: 'Trà đá', qty: 2, price: 5000 },
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
  productName: 'Cà phê sữa đá',
  price: 29000,
  barcode: '8930000000012',
  note: 'Ít đá',
});
```

## API Queue

### `getQueue()`

Lấy danh sách job in trong hàng đợi.

```ts
const queue = await printer.getQueue();
```

### `getFailedQueue()`

Lấy danh sách job in đã lỗi sau khi retry hết số lần cho phép.

```ts
const failedJobs = await printer.getFailedQueue();
```

Job lỗi có thể chứa payload gốc để FE hiển thị lại nội dung bill/món bị lỗi:

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

Retry toàn bộ job lỗi:

```ts
await printer.retryQueue();
```

Retry một job cụ thể:

```ts
await printer.retryQueue({ id: 5 });
```

Hoặc:

```ts
await printer.retryQueue({ jobId: 5 });
```

### `clearQueue()`

Xóa các job trong queue theo logic của service.

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

## Xử Lý Lỗi Cho FE

Tất cả method trong SDK có thể throw `PrinterSDKError`.

Có 2 nhóm lỗi chính:

1. Service đang chạy nhưng API trả HTTP lỗi, ví dụ sai `printerId`, thiếu field, không tìm thấy LAN alias.
2. Service không kết nối được, ví dụ app in chưa mở hoặc port `9000` chưa listen.

Ví dụ bắt lỗi chuẩn ở FE:

```ts
import { PrinterSDK, PrinterSDKError } from '@nemoprint/printer-sdk';

const printer = new PrinterSDK();

try {
  const printers = await printer.getPrinters();
  console.log(printers);
} catch (error) {
  if (error instanceof PrinterSDKError) {
    showToast(error.message);
    return;
  }

  showToast('Có lỗi không xác định khi kết nối máy in');
}
```

Khi service chưa chạy, SDK sẽ throw message:

```text
Khong ket noi duoc Printer Service. Vui long mo lai ung dung in.
```

FE nên hiển thị message này bằng toast/modal/snackbar tùy UI của dự án. SDK không tự `alert`, vì SDK không biết FE đang dùng React, Vue, Angular, mobile web hay POS desktop.

Các thông tin lỗi có sẵn:

```ts
try {
  await printer.testPrint('unknown-printer');
} catch (error) {
  if (error instanceof PrinterSDKError) {
    console.log(error.message); // message thân thiện
    console.log(error.status);  // HTTP status nếu có
    console.log(error.details); // response body hoặc lỗi gốc
  }
}
```

## Thứ Tự Gọi API Đề Xuất

### In bằng máy in đã có

```ts
const printer = new PrinterSDK();

await printer.health();

const printers = await printer.getPrinters();
const selectedPrinter = printers.find((item) => item.status === 'online') ?? printers[0];

await printer.testPrint(selectedPrinter.id);

await printer.printKitchen(selectedPrinter.id, {
  language: 'vi',
  table: 'B05',
  items: [{ name: 'Phở bò', qty: 1 }],
});
```

### Thêm máy in LAN mới

```ts
const discovery = await printer.discoverLanPrinters();
const target = discovery.printers[0];

await printer.testLanPrinter({
  host: target.ip,
  port: target.port,
});

await printer.saveLanPrinter({
  id: 'kitchen-01',
  name: 'Máy in bếp',
  host: target.ip,
  port: target.port,
});
```

### Đổi tên hoặc xóa máy in LAN đã lưu

```ts
await printer.renameLanPrinter('kitchen-01', 'Máy in bếp tầng 1');
await printer.deleteLanPrinter('kitchen-01');
```

## Publish Lên Npm

Package hiện dùng scope:

```text
@nemoprint/printer-sdk
```

Trước khi publish:

```bash
npm login
npm whoami
npm run build
npm publish --access public
```

Trên Windows:

```powershell
npm.cmd run build
npm.cmd publish --access public
```
