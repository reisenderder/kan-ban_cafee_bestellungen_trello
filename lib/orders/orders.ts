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
  /** Блок 2, пункт 7: короткий код доступа (открытый). Присутствует только сразу
   *  после создания заказа и в локальном списке «Мои заказы» этого устройства. */
  chatAccessCode?: string;
}

const ORDERS_STORAGE_KEY = 'daymohk_orders';
const MY_ORDERS_KEY = 'daymohk_my_orders';

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const seq = String(now.getTime()).slice(-6);
  return `${y}${m}${d}-${seq}`;
}

/** 4-значный код доступа к заказу и чату (Блок 2, пункт 7). */
function generateChatAccessCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Укрупнённый клиентский этап заказа (Feature_Client_Tracking.md §6, §8). */
export function clientStageLabel(status: OrderStatus | string): string {
  switch (status) {
    case 'NEW':
    case 'ACCEPTED':
      return 'Заказ принят';
    case 'COOKING':
    case 'READY_FOR_DELIVERY':
      return 'На кухне';
    case 'IN_TRANSIT':
      return 'Уже в пути';
    case 'DELIVERED':
    case 'CLOSED':
      return 'Доставлен';
    case 'CANCELLED':
      return 'Отменён';
    default:
      return 'В обработке';
  }
}

export interface MyOrderRef {
  id: string;
  orderNumber: string;
  chatAccessCode: string;
  createdAt: string;
}

/** Локальный список заказов, оформленных на этом устройстве (для панели «Мои заказы»). */
export function getMyOrders(): MyOrderRef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MY_ORDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function addMyOrder(ref: MyOrderRef) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getMyOrders().filter((o) => o.orderNumber !== ref.orderNumber);
    localStorage.setItem(MY_ORDERS_KEY, JSON.stringify([ref, ...existing].slice(0, 30)));
  } catch (e) {}
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
  // Код доступа генерируется здесь — то есть уже ПОСЛЕ успешной OTP-верификации,
  // потому что createOrderInSupabase вызывается из onVerifySuccess (Блок 2, пункт 7).
  const chatAccessCode = generateChatAccessCode();
  const chatAccessCodeHash = await sha256Hex(chatAccessCode);

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
    chatAccessCode,
  };

  const stored = getStoredOrders();
  stored.unshift(order);
  saveStoredOrders(stored);

  try {
    const supabase = createClient();
    // Создаём заказ через RPC create_client_order (SECURITY DEFINER): после включения
    // RLS у анонимного ключа нет и не должно быть SELECT на orders, а прямой
    // INSERT ... RETURNING в этом случае откатывается PostgREST целиком.
    const { data, error } = await supabase.rpc('create_client_order', {
      p_order_number: order.orderNumber,
      p_customer_name: order.customerName,
      p_customer_phone: order.customerPhone,
      p_address: order.address,
      p_items: order.items,
      p_total_amount: order.totalAmount,
      p_chat_access_code_hash: chatAccessCodeHash,
    });

    const row = Array.isArray(data) ? data[0] : data;
    if (!error && row?.id) {
      order.id = row.id;
      const updated = getStoredOrders().map((o) =>
        o.orderNumber === order.orderNumber ? order : o
      );
      saveStoredOrders(updated);
    }
  } catch (err) {
    // Supabase недоступен — заказ остаётся сохранённым локально
  }

  addMyOrder({
    id: order.id,
    orderNumber: order.orderNumber,
    chatAccessCode,
    createdAt: order.createdAt,
  });

  return order;
}

/**
 * Возврат клиента к заказу с любого устройства по паре «номер заказа + код доступа»
 * (Блок 2, пункт 7). Идёт через RPC get_order_by_access (SECURITY DEFINER), а не
 * открытым SELECT. Локальная подстраховка — по списку «Мои заказы» этого устройства.
 */
export async function fetchOrderByNumberAndCode(
  orderNumber: string,
  code: string
): Promise<Order | null> {
  const num = orderNumber.trim();
  const c = code.trim();
  if (!num || !c) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('get_order_by_access', {
      p_order_number: num,
      p_code: c,
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      const row: any = data[0];
      return {
        id: row.id,
        orderNumber: row.order_number,
        customerName: '',
        customerPhone: '',
        address: '',
        status: row.status,
        items: row.items || [],
        totalAmount: Number(row.total_amount),
        createdAt: row.created_at,
      };
    }
  } catch (err) {
    // ignore — падаем на локальную подстраховку
  }

  const local = getStoredOrders().find(
    (o) => o.orderNumber === num && o.chatAccessCode === c
  );
  return local || null;
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
 * с любого устройства клиента без перезагрузки страницы менеджера.
 *
 * После включения RLS таблица orders закрыта политикой orders_staff_select —
 * Realtime отдаёт события по ней только соединению, авторизованному токеном
 * вошедшего менеджера/админа. Поэтому перед подпиской явно передаём в сокет
 * access_token текущей сессии (иначе события молча не приходят, и заказ
 * появляется в CRM только после ручного обновления страницы).
 */
export function subscribeToOrdersRealtime(onChange: () => void): () => void {
  const supabase = createClient();
  let channel: ReturnType<typeof supabase.channel> | null = null;
  let cancelled = false;

  (async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.access_token) {
        await supabase.realtime.setAuth(session.access_token);
      }
      channel = supabase
        .channel('orders-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
          onChange();
        })
        .subscribe((status, err) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('[orders-realtime]', status, err?.message ?? '', 'role:', (session?.user?.app_metadata as Record<string, unknown> | undefined)?.role ?? 'нет сессии');
          }
        });
    } catch (err) {
      // Realtime недоступен — CRM продолжает работать по ручному обновлению
    }
  })();

  return () => {
    cancelled = true;
    if (channel) supabase.removeChannel(channel);
  };
}
