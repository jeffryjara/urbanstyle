export type UserRole = 'gerencia' | 'ventas';

export interface UserSession {
  role: UserRole;
  name: string;
  email: string;
  title: string;
  location: string;
  avatarUrl?: string;
}

export interface UserAccount extends UserSession {
  password: string;
}

export type ShoeBrand = 'Adidas' | 'Nike' | 'Puma' | 'Reebok' | 'New Balance' | 'Vans' | 'Converse';

export interface Product {
  id: string;
  name: string;
  brand: ShoeBrand;
  category: string;
  sku: string;
  price: number;
  stock: number;
  sizes: number[];
  image: string;
  isNew?: boolean;
  cost?: number;
}

export interface CartItem {
  product: Product;
  selectedSize: number;
  quantity: number;
}

export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin' | 'Transferencia';

export interface AuditRecord {
  id: string;
  time: string;
  client: string;
  channel: 'Tienda física' | 'WhatsApp' | 'Instagram' | 'TikTok' | 'Facebook' | 'Web' | 'B2B Corporativo';
  payment: 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin' | 'Transferencia' | 'POS Débito' | 'Yape QR' | 'Transferencia BCP';
  total: number;
  sunatNumber: string;
  type: 'Boleta' | 'Factura' | 'Nota de Crédito';
  status: 'Procesado' | 'Sincronizado' | 'Anulado';
}

export interface ETLLog {
  id: number;
  process: string;
  startTime: string;
  duration: string;
  records: number;
  status: 'EXITOSO' | 'EN PROCESO' | 'ERROR';
  table: string;
}

export interface MonthlySalesData {
  month: string;
  digital: number;
  store: number;
  total: number;
}

export interface QueryResult {
  columns: string[];
  rows: (string | number | boolean | null)[][];
  rowCount: number;
  executionTimeMs: number;
  affectedRows?: number;
  message?: string;
  isError?: boolean;
  operation?: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'EXEC' | 'OTHER';
}
