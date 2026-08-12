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
  port?: string;
  [key: string]: unknown;
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

export interface PrintPayload<TTemplate extends PrintTemplate = PrintTemplate, TData = unknown> {
  printer: string;
  template: TTemplate;
  data: TData;
}

export type PrintJobStatus = 'waiting' | 'printing' | 'completed' | 'failed';

export interface PrintJob {
  id: number;
  status: PrintJobStatus;
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
}

export interface PrintResponse {
  success: true;
  message: string;
  job: PrintJob;
}

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
}
