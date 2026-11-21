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

export interface Product {
  id: string;
  name: string;
  brand: 'Nike' | 'Adidas' | 'Puma' | 'New Balance';
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

export type PaymentMethod = 'Yape' | 'Plin' | 'Efectivo' | 'Tarjeta';

export interface AuditRecord {
  id: string;
  time: string;
  client: string;
  channel: 'Tienda Física' | 'WhatsApp Store' | 'B2B Corporativo' | 'Web' | 'Instagram';
  payment: 'POS Débito' | 'Yape QR' | 'Transferencia BCP' | 'Efectivo' | 'Plin';
  total: number;
  sunatNumber: string;
  type: 'Boleta' | 'Factura';
  status: 'Procesado' | 'Sincronizado';
}

export interface ETLLog {
  id: number;
  process: string;
  startTime: string;
  duration: string;
  records: number;
  status: 'EXITOSO' | 'EN PROCESO';
  table: string;
}

export interface MonthlySalesData {
  month: string;
  digital: number;
  store: number;
  total: number;
}
