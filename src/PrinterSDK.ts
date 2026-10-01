import {
  BillData,
  ClearQueueResponse,
  FailedPrintJob,
  HealthStatus,
  InvoicePrintPayload,
  KitchenData,
  LanPrinterActionResponse,
  LanPrinterDiscoveryOptions,
  LanPrinterDiscoveryResponse,
  LabelData,
  PrintPayload,
  PrintResponse,
  PrinterInfo,
  PrinterSDKOptions,
  ReceiptData,
  RenameLanPrinterPayload,
  RetryQueuePayload,
  SaveLanPrinterPayload,
  TestLanPrinterPayload,
  UpdatePrinterCategoriesPayload,
  TestPrintResponse,
  PrintJob,
} from './types';

export class PrinterSDKError extends Error {
  readonly status?: number;
  readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'PrinterSDKError';
    this.status = status;
    this.details = details;
  }
}

export class PrinterSDK {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: PrinterSDKOptions = {}) {
    this.baseUrl = this.normalizeBaseUrl(options.baseUrl ?? 'http://localhost:9000');
    this.fetchImpl = options.fetchImpl ?? this.getGlobalFetch();
  }

  health(): Promise<HealthStatus> {
    return this.request<HealthStatus>('/api/health');
  }

  getPrinters(): Promise<PrinterInfo[]> {
    return this.request<PrinterInfo[]>('/api/printers');
  }

  discoverLanPrinters(options: LanPrinterDiscoveryOptions = {}): Promise<LanPrinterDiscoveryResponse> {
    return this.request<LanPrinterDiscoveryResponse>('/api/printers/lan/discover', {
      query: { ...options },
    });
  }

  testLanPrinter(payload: TestLanPrinterPayload): Promise<TestPrintResponse> {
    return this.request<TestPrintResponse>('/api/printers/lan/test', {
      method: 'POST',
      body: payload,
    });
  }

  saveLanPrinter(payload: SaveLanPrinterPayload): Promise<LanPrinterActionResponse> {
    return this.request<LanPrinterActionResponse>('/api/printers/lan/save', {
      method: 'POST',
      body: payload,
    });
  }

  updatePrinterCategories(
    id: string,
    payload: UpdatePrinterCategoriesPayload | string[]
  ): Promise<LanPrinterActionResponse> {
    return this.request<LanPrinterActionResponse>(`/api/printers/${encodeURIComponent(id)}/categories`, {
      method: 'PATCH',
      body: Array.isArray(payload) ? { categoryIds: payload } : payload,
    });
  }

  renameLanPrinter(id: string, payload: RenameLanPrinterPayload | string): Promise<LanPrinterActionResponse> {
    return this.request<LanPrinterActionResponse>(`/api/printers/lan/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: typeof payload === 'string' ? { name: payload } : payload,
    });
  }

  deleteLanPrinter(id: string): Promise<LanPrinterActionResponse> {
    return this.request<LanPrinterActionResponse>(`/api/printers/lan/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  testPrint(printerId: string): Promise<TestPrintResponse> {
    return this.request<TestPrintResponse>('/api/printers/test', {
      method: 'POST',
      body: { printerId },
    });
  }

  print<TPayload extends PrintPayload>(payload: TPayload): Promise<PrintResponse> {
    return this.request<PrintResponse>('/api/print', {
      method: 'POST',
      body: payload,
    });
  }

  printInvoice(payload: InvoicePrintPayload): Promise<PrintResponse> {
    return this.print(payload);
  }

  printReceipt(printer: string, data: ReceiptData): Promise<PrintResponse> {
    return this.print({ printer, template: 'receipt', data });
  }

  printKitchen(printer: string, data: KitchenData): Promise<PrintResponse> {
    return this.print({ printer, template: 'kitchen', data });
  }

  printKitchenByCategory(categoryId: string, data: KitchenData): Promise<PrintResponse> {
    return this.print({ categoryId, template: 'kitchen', data });
  }

  printKitchenByItemCategories(data: KitchenData): Promise<PrintResponse> {
    return this.print({ template: 'kitchen', data });
  }

  printBill(printer: string, data: BillData): Promise<PrintResponse> {
    return this.print({ printer, template: 'bill', data });
  }

  printLabel(printer: string, data: LabelData): Promise<PrintResponse> {
    return this.print({ printer, template: 'label', data });
  }

  getQueue(): Promise<PrintJob[]> {
    return this.request<PrintJob[]>('/api/queue');
  }

  getFailedQueue(): Promise<FailedPrintJob[]> {
    return this.request<FailedPrintJob[]>('/api/queue/failed');
  }

  clearQueue(): Promise<ClearQueueResponse> {
    return this.request<ClearQueueResponse>('/api/queue', {
      method: 'DELETE',
    });
  }

  retryQueue(payload: RetryQueuePayload = {}): Promise<PrintJob[]> {
    return this.request<PrintJob[]>('/api/queue/retry', {
      method: 'POST',
      body: payload,
    });
  }

  private async request<TResponse>(
    path: string,
    options: { method?: string; body?: unknown; query?: Record<string, unknown> } = {}
  ): Promise<TResponse> {
    let response: Response;

    try {
      response = await this.fetchImpl(this.buildUrl(path, options.query), {
        method: options.method ?? 'GET',
        headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch (error) {
      throw new PrinterSDKError('Khong ket noi duoc Printer Service. Vui long mo lai ung dung in.', undefined, error);
    }

    const data = await this.readResponse(response);

    if (!response.ok) {
      const message = this.getErrorMessage(data, response.statusText);
      throw new PrinterSDKError(message, response.status, data);
    }

    return data as TResponse;
  }

  private async readResponse(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return undefined;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private getErrorMessage(data: unknown, fallback: string): string {
    if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
      return data.message;
    }

    return fallback || 'Printer service request failed';
  }

  private buildUrl(path: string, query?: Record<string, unknown>): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }

    const queryString = params.toString();
    return queryString ? `${this.baseUrl}${path}?${queryString}` : `${this.baseUrl}${path}`;
  }

  private normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.replace(/\/+$/, '');
  }

  private getGlobalFetch(): typeof fetch {
    if (typeof fetch !== 'function') {
      throw new PrinterSDKError('No fetch implementation found. Pass fetchImpl in PrinterSDK options.');
    }

    return fetch;
  }
}
