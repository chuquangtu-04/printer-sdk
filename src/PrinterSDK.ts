import {
  BillData,
  ClearQueueResponse,
  HealthStatus,
  KitchenData,
  LabelData,
  PrintPayload,
  PrintResponse,
  PrinterInfo,
  PrinterSDKOptions,
  ReceiptData,
  RetryQueuePayload,
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

  printReceipt(printer: string, data: ReceiptData): Promise<PrintResponse> {
    return this.print({ printer, template: 'receipt', data });
  }

  printKitchen(printer: string, data: KitchenData): Promise<PrintResponse> {
    return this.print({ printer, template: 'kitchen', data });
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
    options: { method?: string; body?: unknown } = {}
  ): Promise<TResponse> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: options.body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

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
