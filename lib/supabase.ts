import { createClient } from '@supabase/supabase-js';
import type { Invoice, CreateInvoiceInput, InvoiceItem } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

function calculateTotal(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export async function createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
  const invoice_number = generateInvoiceNumber();
  const total = calculateTotal(input.items);

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      invoice_number,
      sender_name: input.sender_name,
      sender_email: input.sender_email,
      sender_wallet: input.sender_wallet,
      client_name: input.client_name,
      client_email: input.client_email,
      items: input.items,
      currency: input.currency,
      total,
      due_date: input.due_date,
      notes: input.notes || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Invoice;
}

export async function getInvoicesBySender(email: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('sender_email', email)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as Invoice[];
}

export async function markInvoicePaid(id: string, tx_hash: string): Promise<void> {
  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      tx_hash,
      paid_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function updateOverdueInvoices(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('invoices')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('due_date', today);
}