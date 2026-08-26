import { createClient } from '../supabase/client';

export type OrderStatus =
  | 'NEW'
  | 'ACCEPTED'
  | 'COOKING'
  | 'READY_FOR_DELIVERY'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'PROBLEM';

export interface OrderItem {
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  createdAt: string;
}

const ORDERS_STORAGE_KEY = 'daymohk_orders';

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(now.getTime()).slice(-6);
  return `${y}${m}${d}-${seq}`;
}

function getStoredOrders(): Order[] {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
  }
  return [];
}

function saveStoredOrders(orders: Order[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {}
  }
}

/**
 * Создать заказ клиента сразу после успешной OTP-верификации и отправить его в Supabase
 * с подстраховкой локальной памяти при работе в оффлайн-режиме (по аналогии с dishes.ts)
 */
export async function createOrderInSupabase(input: {
  customerName: string;
  customerPhone: string;
  address: string;
  items: OrderItem[];
  totalAmount: number;
}): Promise<Order> {
  const order: Order = {
    id: `order-${Date.now()}`,
    orderNumber: generateOrderNumber(),
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    address: input.address,
    status: 'NEW',
    items: input.items,
    totalAmount: input.totalAmount,
    createdAt: new Date().toISOString(),
  };

  const stored = getStoredOrders();
  stored.unshift(order);
  saveStoredOrders(stored);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .insert({
        order_number: order.orderNumber,
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        address: order.address,
        status: order.status,
        items: order.items,
        total_amount: order.totalAmount,
      })
      .select()
      .single();

    if (!error && data) {
      order.id = data.id;
      const updated = getStoredOrders().map((o) =>
        o.orderNumber === order.orderNumber ? order : o
      );
      saveStoredOrders(updated);
    }
  } catch (err) {
    // Supabase недоступен — заказ остаётся сохранённым локально
  }

  return order;
}

/**
 * Получить все заказы для CRM менеджера из Supabase
 */
export async function fetchAllOrders(): Promise<Order[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const fetched: Order[] = data.map((row: any) => ({
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        address: row.address,
        status: row.status,
        items: row.items || [],
        totalAmount: Number(row.total_amount),
        createdAt: row.created_at,
      }));
      saveStoredOrders(fetched);
      return fetched;
    }
  } catch (err) {
    // ignore
  }
  return getStoredOrders();
}

/**
 * Изменить статус заказа (перевод по колонкам канбана CRM)
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: OrderStatus
): Promise<boolean> {
  const stored = getStoredOrders();
  const local = stored.find((o) => o.id === orderId);
  if (local) {
    local.status = newStatus;
    saveStoredOrders(stored);
  }

  try {
    const supabase = createClient();
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
  } catch (err) {
    // ignore
  }

  return true;
}

/**
 * Подписка на Supabase Realtime: уведомляет CRM о новых заказах и изменениях статуса
 * с любого устройства клиента без перезагрузки страницы менеджера
 */
export function subscribeToOrdersRealtime(onChange: () => void): () => void {
  try {
    const supabase = createClient();
    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        onChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    return () => {};
  }
}
