export type PrinterLanguage = 'vi' | 'en';

export type PrintTemplate = 'receipt' | 'kitchen' | 'bill' | 'label';

export interface PrinterSDKOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface HealthStatus {
  success: boolean;
  version: string;
  status: string;
}

export interface PrinterInfo {
  id: string;
  name: string;
  status?: string;
  type?: string;
  ip?: string;
  port?: string | number;
  categoryIds?: string[];
  [key: string]: unknown;
}

export interface LanPrinterDiscoveryOptions {
  subnetIp?: string;
  netmask?: string;
  concurrency?: number;
  timeoutMs?: number;
}

export type LanPrinterConfidence = 'high' | 'maybe';

export interface LanPrinterCandidate {
  ip: string;
  port: number;
  printPorts: number[];
  openPorts: number[];
  confidence: LanPrinterConfidence;
  name: string;
  hostname?: string;
}

export interface LanPrinterDiscoveryResponse {
  success: true;
  subnetIp: string;
  netmask: string;
  ports: number[];
  scannedHosts: number;
  total: number;
  printers: LanPrinterCandidate[];
}

export interface TestLanPrinterPayload {
  host: string;
  port?: number;
}

export interface SaveLanPrinterPayload {
  id: string;
  name: string;
  host: string;
  port?: number;
  categoryIds?: string[];
}

export interface RenameLanPrinterPayload {
  name: string;
}

export interface UpdatePrinterCategoriesPayload {
  categoryIds: string[];
}

export interface ConfiguredLanPrinter {
  id: string;
  name: string;
  enabled: boolean;
  connection: {
    type: 'tcp';
    host: string;
    port?: number;
  };
  categoryIds: string[];
}

export interface LanPrinterActionResponse {
  success: true;
  message: string;
  printer: ConfiguredLanPrinter;
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
}

export interface ReceiptData {
  storeName?: string;
  orderId?: string;
  items: ReceiptItem[];
  total?: number;
  note?: string;
}

export interface KitchenItem {
  name: string;
  qty: number;
  note?: string;
  categoryId?: string;
  category_id?: string;
  category?: string;
}

export interface KitchenData {
  language?: PrinterLanguage;
  orderId?: string;
  billId?: string;
  table?: string;
  note?: string;
  orderNote?: string;
  items: KitchenItem[];
}

export interface BillItem {
  name: string;
  qty: number;
  price: number;
}

export interface BillData {
  storeName?: string;
  table?: string;
  items: BillItem[];
  total?: number;
  discount?: number;
  tax?: number;
  finalTotal?: number;
}

export interface LabelData {
  productName: string;
  price?: number;
  barcode?: string;
  note?: string;
}

export interface TemplatePrintPayload<TTemplate extends PrintTemplate = PrintTemplate, TData = unknown> {
  printer: string;
  template: TTemplate;
  data: TData;
}

export interface CategoryPrintPayload<TTemplate extends PrintTemplate = PrintTemplate, TData = unknown> {
  categoryId: string;
  template: TTemplate;
  data: TData;
}

export interface ItemCategoryPrintPayload<TTemplate extends PrintTemplate = PrintTemplate, TData = unknown> {
  template: TTemplate;
  data: TData;
}

export interface ReceiptHeader {
  store_name?: string;
  storeName?: string;
  address?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface InvoiceBarcode {
  type?: string;
  value: string;
}

export interface InvoiceQrCode {
  value: string;
}

export interface InvoiceInfo {
  title?: string;
  barcode?: InvoiceBarcode;
  qrcode?: InvoiceQrCode;
  code?: string;
  created_at?: string;
  createdAt?: string;
  customer?: string;
  seller?: string;
  [key: string]: unknown;
}

export interface InvoiceItem {
  name: string;
  quantity?: number;
  qty?: number;
  unit_price?: number;
  unitPrice?: number;
  price?: number;
  discount?: number;
  amount?: number;
  note?: string;
  [key: string]: unknown;
}

export interface InvoiceSummary {
  subtotal?: number;
  discount?: number;
  voucher?: number;
  points?: number;
  tax?: number;
  total?: number;
  [key: string]: unknown;
}

export interface InvoicePayment {
  method?: string;
  amount?: number;
  [key: string]: unknown;
}

export interface InvoicePrintPayload {
  printer: string;
  template: 'receipt';
  header?: ReceiptHeader;
  branch_name?: string;
  branchName?: string;
  invoice?: InvoiceInfo;
  items?: InvoiceItem[];
  summary?: InvoiceSummary;
  payment?: InvoicePayment;
  data?: never;
  [key: string]: unknown;
}

export type PrintPayload<TTemplate extends PrintTemplate = PrintTemplate, TData = unknown> =
  | TemplatePrintPayload<TTemplate, TData>
  | CategoryPrintPayload<TTemplate, TData>
  | ItemCategoryPrintPayload<TTemplate, TData>
  | InvoicePrintPayload;

export type PrintJobStatus = 'waiting' | 'printing' | 'spooled' | 'completed' | 'failed';

export interface PrintJob {
  id: number;
  status: PrintJobStatus;
  printer: string;
  printerName: string;
  template: string;
  categoryId?: string;
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  lastError?: string;
  spoolerJobId?: number;
}

export interface FailedPrintJob extends PrintJob {
  status: 'failed';
  data?: unknown;
  payload?: unknown;
}

export type PrintResponse =
  | { success: true; message: string; job: PrintJob }
  | { success: true; message: string; jobs: PrintJob[] };

export interface TestPrintResponse {
  success: true;
  message: string;
}

export interface ClearQueueResponse {
  success: true;
  removed: number;
}

export interface RetryQueuePayload {
  id?: number;
  jobId?: number;
}
