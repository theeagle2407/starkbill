export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export type Currency = 'USDC' | 'STRK';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  sender_name: string;
  sender_email: string;
  sender_wallet: string;
  client_name: string;
  client_email: string;
  items: InvoiceItem[];
  currency: Currency;
  total: number;
  due_date: string;
  status: InvoiceStatus;
  tx_hash: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface CreateInvoiceInput {
  sender_name: string;
  sender_email: string;
  sender_wallet: string;
  client_name: string;
  client_email: string;
  items: InvoiceItem[];
  currency: Currency;
  due_date: string;
  notes?: string;
}