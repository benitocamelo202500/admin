import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  role: 'administrator' | 'logistic';
  full_name: string;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Weapon {
  id: string;
  name: string;
  category: string;
  caliber: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  description: string;
  image_url: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  total_amount: number;
  documents_validated: boolean;
  stock_validated: boolean;
  documents_validator_id: string | null;
  stock_validator_id: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  order_items?: OrderItem[];
  order_documents?: OrderDocument[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  weapon_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  weapon?: Weapon;
}

export interface OrderDocument {
  id: string;
  order_id: string;
  document_type: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
}

export interface OrderValidation {
  id: string;
  order_id: string;
  admin_user_id: string;
  validation_type: 'documents' | 'stock';
  status: 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
}

export async function loginAdmin(username: string, password: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .eq('password_hash', password)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      order_items(
        *,
        weapon:weapons(*)
      ),
      order_documents(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      order_items(
        *,
        weapon:weapons(*)
      ),
      order_documents(*)
    `)
    .eq('id', orderId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching order:', error);
    return null;
  }

  return data;
}

export async function validateDocuments(
  orderId: string,
  adminUserId: string,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<boolean> {
  const { error: validationError } = await supabase
    .from('order_validations')
    .insert({
      order_id: orderId,
      admin_user_id: adminUserId,
      validation_type: 'documents',
      status,
      notes: notes || null,
    });

  if (validationError) {
    console.error('Error creating validation:', validationError);
    return false;
  }

  const updateData: any = {
    documents_validated: status === 'approved',
    documents_validator_id: adminUserId,
  };

  if (status === 'rejected') {
    updateData.status = 'rechazado';
  } else {
    const { data: order } = await supabase
      .from('orders')
      .select('stock_validated')
      .eq('id', orderId)
      .maybeSingle();

    if (order?.stock_validated) {
      updateData.status = 'aprobado';
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order:', updateError);
    return false;
  }

  return true;
}

export async function validateStock(
  orderId: string,
  adminUserId: string,
  status: 'approved' | 'rejected',
  notes?: string
): Promise<boolean> {
  const { error: validationError } = await supabase
    .from('order_validations')
    .insert({
      order_id: orderId,
      admin_user_id: adminUserId,
      validation_type: 'stock',
      status,
      notes: notes || null,
    });

  if (validationError) {
    console.error('Error creating validation:', validationError);
    return false;
  }

  const updateData: any = {
    stock_validated: status === 'approved',
    stock_validator_id: adminUserId,
  };

  if (status === 'rejected') {
    updateData.status = 'rechazado';
  } else {
    const { data: order } = await supabase
      .from('orders')
      .select('documents_validated')
      .eq('id', orderId)
      .maybeSingle();

    if (order?.documents_validated) {
      updateData.status = 'aprobado';
    }
  }

  const { error: updateError } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (updateError) {
    console.error('Error updating order:', updateError);
    return false;
  }

  return true;
}

export async function getRequiredDocuments(orderItems: OrderItem[]): Promise<string[]> {
  const documentTypes = new Set<string>();

  documentTypes.add('DNI');
  documentTypes.add('Certificado de Antecedentes Penales');
  documentTypes.add('Certificado de Salud Mental');

  orderItems.forEach(item => {
    if (item.weapon) {
      const category = item.weapon.category.toLowerCase();

      if (category.includes('pistola') || category.includes('revólver')) {
        documentTypes.add('Licencia de Uso de Armas Tipo A');
      } else if (category.includes('rifle') || category.includes('escopeta')) {
        documentTypes.add('Licencia de Uso de Armas Tipo B');
      }

      documentTypes.add('Certificado de Capacitación en Manejo de Armas');
    }
  });

  return Array.from(documentTypes).sort();
}
