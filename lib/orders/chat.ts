import { createClient } from '../supabase/client';

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: 'CLIENT' | 'MANAGER';
  text: string;
  isReadByManager: boolean;
  createdAt: string;
}

function storageKey(orderId: string): string {
  return `daymohk_chat_${orderId}`;
}

function getStoredMessages(orderId: string): ChatMessage[] {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(storageKey(orderId));
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
  }
  return [];
}

function saveStoredMessages(orderId: string, messages: ChatMessage[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey(orderId), JSON.stringify(messages));
    } catch (e) {}
  }
}

/**
 * Отправить сообщение в чат заказа (от клиента или от менеджера)
 */
export async function sendChatMessage(
  orderId: string,
  sender: 'CLIENT' | 'MANAGER',
  text: string
): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: `msg-${Date.now()}`,
    orderId,
    sender,
    text,
    isReadByManager: sender === 'MANAGER',
    createdAt: new Date().toISOString(),
  };

  const stored = getStoredMessages(orderId);
  stored.push(message);
  saveStoredMessages(orderId, stored);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('order_chat_messages')
      .insert({
        order_id: orderId,
        sender,
        text,
        is_read_by_manager: message.isReadByManager,
      })
      .select()
      .single();

    if (!error && data) {
      message.id = data.id;
      const updated = getStoredMessages(orderId).map((m) =>
        m.createdAt === message.createdAt && m.text === message.text ? message : m
      );
      saveStoredMessages(orderId, updated);
    }
  } catch (err) {
    // Supabase недоступен — сообщение остаётся сохранённым локально
  }

  return message;
}

/**
 * Получить всю переписку по заказу
 */
export async function fetchChatMessages(orderId: string): Promise<ChatMessage[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('order_chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      const fetched: ChatMessage[] = data.map((row: any) => ({
        id: row.id,
        orderId: row.order_id,
        sender: row.sender,
        text: row.text,
        isReadByManager: row.is_read_by_manager,
        createdAt: row.created_at,
      }));
      saveStoredMessages(orderId, fetched);
      return fetched;
    }
  } catch (err) {
    // ignore
  }
  return getStoredMessages(orderId);
}

/**
 * Отметить сообщения клиента как прочитанные менеджером (сбрасывает счётчик непрочитанных)
 */
export async function markMessagesReadByManager(orderId: string): Promise<void> {
  const stored = getStoredMessages(orderId).map((m) =>
    m.sender === 'CLIENT' ? { ...m, isReadByManager: true } : m
  );
  saveStoredMessages(orderId, stored);

  try {
    const supabase = createClient();
    await supabase
      .from('order_chat_messages')
      .update({ is_read_by_manager: true })
      .eq('order_id', orderId)
      .eq('sender', 'CLIENT');
  } catch (err) {
    // ignore
  }
}

/**
 * Количество непрочитанных сообщений клиента по каждому заказу (для бейджа на канбане CRM)
 */
export async function fetchUnreadCounts(): Promise<Record<string, number>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('order_chat_messages')
      .select('order_id')
      .eq('sender', 'CLIENT')
      .eq('is_read_by_manager', false);

    if (!error && data) {
      const counts: Record<string, number> = {};
      data.forEach((row: any) => {
        counts[row.order_id] = (counts[row.order_id] || 0) + 1;
      });
      return counts;
    }
  } catch (err) {
    // ignore
  }
  return getLocalUnreadCounts();
}

/**
 * Локальный fallback для счётчика непрочитанных, когда Supabase недоступен
 * (сканирует localStorage по всем сохранённым чатам заказов)
 */
function getLocalUnreadCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  if (typeof window === 'undefined') return counts;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('daymohk_chat_')) continue;
    const orderId = key.slice('daymohk_chat_'.length);
    const messages = getStoredMessages(orderId);
    const unread = messages.filter((m) => m.sender === 'CLIENT' && !m.isReadByManager).length;
    if (unread > 0) counts[orderId] = unread;
  }
  return counts;
}

/**
 * Подписка на Realtime переписки конкретного заказа (для открытого окна чата)
 */
export function subscribeToChatRealtime(orderId: string, onChange: () => void): () => void {
  try {
    const supabase = createClient();
    const channel = supabase
      .channel(`order-chat-${orderId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_chat_messages', filter: `order_id=eq.${orderId}` },
        () => {
          onChange();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    return () => {};
  }
}

/**
 * Подписка на Realtime по всем чатам (для обновления бейджей непрочитанных на канбане CRM)
 */
export function subscribeToAllChatRealtime(onChange: () => void): () => void {
  try {
    const supabase = createClient();
    const channel = supabase
      .channel('order-chat-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_chat_messages' }, () => {
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
