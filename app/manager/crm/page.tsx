'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Order,
  OrderStatus,
  fetchAllOrders,
  updateOrderStatusInSupabase,
  subscribeToOrdersRealtime,
} from '../../../lib/orders/orders';
import {
  ChatMessage,
  fetchChatMessages,
  sendChatMessage,
  markMessagesReadByManager,
  fetchUnreadCounts,
  subscribeToChatRealtime,
  subscribeToAllChatRealtime,
} from '../../../lib/orders/chat';
import { StaffTopNav } from '../../../components/StaffTopNav';

export interface CrmOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhoneMasked: string;
  address: string;
  status: OrderStatus;
  itemsSummary: string;
  totalAmount: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
  unreadMessagesCount?: number;
}

// Маскирует телефон клиента для отображения в CRM (полный номер не должен быть виден без необходимости)
function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone;
  return `${phone.slice(0, 6)}****${phone.slice(-2)}`;
}

function mapOrderToCrmOrder(order: Order): CrmOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhoneMasked: maskPhone(order.customerPhone),
    address: order.address,
    status: order.status,
    itemsSummary: order.items.map((item) => `${item.title} x${item.quantity}`).join(', '),
    totalAmount: order.totalAmount,
    createdAt: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: order.items.map((item) => ({ name: item.title, quantity: item.quantity })),
  };
}

// Status columns in Kanban
const columns: { title: string; status: OrderStatus; color: string }[] = [
  { title: 'Новые заказы', status: 'NEW', color: 'var(--color-marigold-zest)' },
  { title: 'Приняты в работу', status: 'ACCEPTED', color: 'var(--color-deep-forest)' },
  { title: 'Готовятся', status: 'COOKING', color: 'var(--color-deep-forest)' },
  { title: 'Готовы к выдаче', status: 'READY_FOR_DELIVERY', color: 'var(--color-success)' },
  { title: 'Доставляются', status: 'IN_TRANSIT', color: 'var(--color-deep-forest)' },
  { title: 'Завершённые', status: 'DELIVERED', color: 'var(--color-text-muted)' },
  { title: 'Проблема / Урегулирование', status: 'PROBLEM', color: 'var(--color-error)' },
];

const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: 'Новый',
  ACCEPTED: 'В работе',
  COOKING: 'Готовится',
  READY_FOR_DELIVERY: 'Готов',
  IN_TRANSIT: 'В пути',
  DELIVERED: 'Завершён',
  PROBLEM: 'Проблема',
};

function statusColor(status: OrderStatus): string {
  return columns.find((c) => c.status === status)?.color ?? 'var(--color-text-muted)';
}

export default function ManagerCrmPage() {
  const [orders, setOrders] = useState<CrmOrder[]>([]);
  const [selectedChatOrder, setSelectedChatOrder] = useState<CrmOrder | null>(null);
  // Раскрытый вид карточки — Side Drawer (Feature_Order_CRM.md §6.1)
  const [detailOrder, setDetailOrder] = useState<CrmOrder | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMsgText, setNewMsgText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    const [fetched, unreadCounts] = await Promise.all([fetchAllOrders(), fetchUnreadCounts()]);
    setOrders(
      fetched.map((order) => ({
        ...mapOrderToCrmOrder(order),
        unreadMessagesCount: unreadCounts[order.id] || 0,
      }))
    );
  }, []);

  // Загрузка реальных заказов из Supabase и подписка на Realtime (новые заказы и сообщения появляются без перезагрузки)
  useEffect(() => {
    loadOrders();
    const unsubOrders = subscribeToOrdersRealtime(() => loadOrders());
    const unsubChat = subscribeToAllChatRealtime(() => loadOrders());
    return () => {
      unsubOrders();
      unsubChat();
    };
  }, [loadOrders]);

  // Живая переписка по открытому заказу
  useEffect(() => {
    if (!selectedChatOrder) return;
    const unsubscribe = subscribeToChatRealtime(selectedChatOrder.id, () => {
      fetchChatMessages(selectedChatOrder.id).then(setChatMessages);
    });
    return unsubscribe;
  }, [selectedChatOrder]);

  // Держим открытый Side Drawer синхронным с обновлениями из Realtime
  useEffect(() => {
    if (!detailOrder) return;
    const fresh = orders.find((o) => o.id === detailOrder.id);
    if (fresh && fresh !== detailOrder) setDetailOrder(fresh);
  }, [orders, detailOrder]);

  // Open Chat Drawer, load real messages and mark them as read (resets unread counter)
  const handleOpenChat = async (order: CrmOrder) => {
    setSelectedChatOrder(order);
    setChatMessages([]);
    const msgs = await fetchChatMessages(order.id);
    setChatMessages(msgs);
    await markMessagesReadByManager(order.id);
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, unreadMessagesCount: 0 } : o))
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    updateOrderStatusInSupabase(orderId, newStatus);
  };

  // Copy order text for courier
  const handleCopyForCourier = (order: CrmOrder) => {
    const courierText = `🚴 ДОСТАВКА DAYMOHKCOFEE\n\n` +
      `📦 Заказ: #${order.orderNumber}\n` +
      `👤 Клиент: ${order.customerName}\n` +
      `📞 Телефон: ${order.customerPhoneMasked}\n` +
      `📍 Адрес: ${order.address}\n\n` +
      `🍲 Состав заказа:\n${order.itemsSummary}\n\n` +
      `💵 Итого к оплате наличными: ${order.totalAmount} EGP`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(courierText);
      setNotification(`✓ Детали заказа #${order.orderNumber} скопированы в буфер обмена!`);
    } else {
      alert(`Скопировано:\n\n${courierText}`);
    }
  };

  // Kitchen print ticket simulation
  const handlePrintKitchenTicket = (order: CrmOrder) => {
    updateOrderStatus(order.id, 'COOKING');
    setNotification(`🍳 Чек заказа #${order.orderNumber} отправлен на кухню! Статус изменён на "Готовится".`);
  };

  const handleEscalate = (order: CrmOrder) => {
    updateOrderStatus(order.id, 'PROBLEM');
    setNotification(`⚠️ Заказ #${order.orderNumber} отправлен в урегулирование.`);
  };

  const handleReturnToWork = (order: CrmOrder) => {
    updateOrderStatus(order.id, 'ACCEPTED');
    setNotification(`✓ Заказ #${order.orderNumber} выведен из урегулирования и возвращён в работу!`);
  };

  // Send message in chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatOrder || !newMsgText.trim()) return;

    const text = newMsgText.trim();
    setNewMsgText('');

    const newMsg = await sendChatMessage(selectedChatOrder.id, 'MANAGER', text);
    setChatMessages((prev) => [...prev, newMsg]);
  };

  // Основное контекстное действие по статусу — показывается и в свёрнутой карточке, и в Drawer
  const primaryAction = (
    ord: CrmOrder
  ): { label: string; run: () => void; tone: 'primary' | 'success' } | null => {
    if (ord.status === 'NEW') return { label: 'Принять', run: () => updateOrderStatus(ord.id, 'ACCEPTED'), tone: 'primary' };
    if (ord.status === 'ACCEPTED') return { label: '🍳 На кухню', run: () => handlePrintKitchenTicket(ord), tone: 'primary' };
    if (ord.status === 'COOKING') return { label: '✓ Готово', run: () => updateOrderStatus(ord.id, 'READY_FOR_DELIVERY'), tone: 'success' };
    return null;
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      <StaffTopNav current="crm" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="badge badge-forest" style={{ marginBottom: '4px' }}>Рабочий контур</span>
          <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>CRM Менеджера Заказов DAYMOHKCOFEE</h1>
        </div>
      </div>

      {notification && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: 'rgba(46, 125, 50, 0.15)',
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700,
          }}
        >
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Kanban Board */}
      <div className="crm-board">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);

          return (
            <div key={col.status} className="crm-column">
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: `2px solid ${col.color}`,
                }}
              >
                <h3 style={{ fontSize: '0.95rem', margin: 0, fontWeight: 700 }}>{col.title}</h3>
                <span
                  style={{
                    backgroundColor: col.color,
                    color: col.status === 'NEW' ? 'var(--color-deep-forest)' : '#FFF',
                    borderRadius: 'var(--radius-full)',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {colOrders.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '16px 0',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.8rem',
                      fontStyle: 'italic',
                    }}
                  >
                    Нет заказов
                  </div>
                ) : (
                  colOrders.map((ord) => {
                    const action = primaryAction(ord);
                    const hasUnread = !!ord.unreadMessagesCount && ord.unreadMessagesCount > 0;

                    return (
                      <button
                        key={ord.id}
                        type="button"
                        className="crm-card"
                        onClick={() => setDetailOrder(ord)}
                        title="Открыть карточку заказа"
                      >
                        {/* Свёрнутый вид: номер + статус */}
                        <div className="crm-card__row">
                          <span className="crm-card__number">#{ord.orderNumber}</span>
                          <span
                            className="crm-card__status"
                            style={{
                              backgroundColor: ord.status === 'NEW' ? statusColor(ord.status) : 'transparent',
                              color: ord.status === 'NEW' ? 'var(--color-deep-forest)' : statusColor(ord.status),
                              border: ord.status === 'NEW' ? 'none' : `1px solid ${statusColor(ord.status)}`,
                            }}
                          >
                            {STATUS_LABEL[ord.status]}
                          </span>
                        </div>

                        {/* Состав */}
                        <div className="crm-card__items">{ord.itemsSummary}</div>

                        {/* Чат + основное действие */}
                        <div className="crm-card__row">
                          <span
                            role="button"
                            tabIndex={0}
                            className={`crm-card__chat${hasUnread ? ' crm-card__chat--unread' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenChat(ord);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOpenChat(ord);
                              }
                            }}
                          >
                            💬 Чат
                            {hasUnread && (
                              <span className="crm-card__unread-badge">{ord.unreadMessagesCount}</span>
                            )}
                          </span>

                          {action && (
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.run();
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  action.run();
                                }
                              }}
                              style={{
                                padding: '5px 12px',
                                borderRadius: 'var(--radius-full)',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                color: '#FFF',
                                backgroundColor:
                                  action.tone === 'success' ? 'var(--color-success)' : 'var(--color-warm-terracotta)',
                              }}
                            >
                              {action.label}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* РАСКРЫТЫЙ ВИД — SIDE DRAWER (адрес, телефон, оплата, полный набор действий) */}
      {detailOrder && (
        <div className="crm-drawer-overlay" onClick={() => setDetailOrder(null)}>
          <div
            className="crm-drawer animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="crm-drawer__head">
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>#{detailOrder.orderNumber}</div>
                <span style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                  {STATUS_LABEL[detailOrder.status]} · {detailOrder.createdAt}
                </span>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <div className="crm-drawer__body">
              <div>
                <div className="crm-drawer__field-label">Клиент</div>
                <div className="crm-drawer__field-value">{detailOrder.customerName}</div>
              </div>
              <div>
                <div className="crm-drawer__field-label">Телефон</div>
                <div className="crm-drawer__field-value">📞 {detailOrder.customerPhoneMasked}</div>
              </div>
              <div>
                <div className="crm-drawer__field-label">Адрес доставки</div>
                <div className="crm-drawer__field-value">📍 {detailOrder.address}</div>
              </div>
              <div>
                <div className="crm-drawer__field-label">Состав заказа</div>
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-subtle)',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem',
                  }}
                >
                  {detailOrder.itemsSummary}
                </div>
              </div>
              <div>
                <div className="crm-drawer__field-label">К оплате наличными</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-deep-forest)' }}>
                  {detailOrder.totalAmount} EGP
                </div>
              </div>

              {/* Действия */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                {(() => {
                  const action = primaryAction(detailOrder);
                  return action ? (
                    <button
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '0.9rem',
                        backgroundColor:
                          action.tone === 'success' ? 'var(--color-success)' : 'var(--color-warm-terracotta)',
                      }}
                      onClick={action.run}
                    >
                      {action.label}
                    </button>
                  ) : null;
                })()}

                <button
                  className="btn-secondary"
                  style={{ width: '100%', padding: '10px', fontSize: '0.9rem' }}
                  onClick={() => handleOpenChat(detailOrder)}
                >
                  💬 Открыть чат с клиентом
                </button>

                <button
                  onClick={() => handleCopyForCourier(detailOrder)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-success)',
                    backgroundColor: 'rgba(46, 125, 50, 0.08)',
                    color: 'var(--color-success)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  📋 Скопировать детали для курьера
                </button>

                {detailOrder.status === 'PROBLEM' ? (
                  <button
                    className="btn-primary"
                    style={{ width: '100%', padding: '10px', fontSize: '0.85rem', backgroundColor: 'var(--color-deep-forest)' }}
                    onClick={() => handleReturnToWork(detailOrder)}
                  >
                    ↩️ Вернуть заказ в работу
                  </button>
                ) : (
                  <button
                    onClick={() => handleEscalate(detailOrder)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-error)',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      marginTop: '2px',
                    }}
                  >
                    ⚠️ Эскалация в урегулирование
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REALTIME CHAT DRAWER MODAL */}
      {selectedChatOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: 'var(--color-surface)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--color-deep-forest)',
                color: 'var(--color-vanilla-cream)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Чат заказа #{selectedChatOrder.orderNumber}</h3>
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Клиент: {selectedChatOrder.customerName}</span>
              </div>
              <button
                onClick={() => setSelectedChatOrder(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Сообщений по заказу пока нет
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender === 'MANAGER' ? 'flex-end' : 'flex-start',
                      backgroundColor: msg.sender === 'MANAGER' ? 'var(--color-deep-forest)' : 'var(--color-surface-subtle)',
                      color: msg.sender === 'MANAGER' ? '#FFF' : 'var(--color-text-primary)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      maxWidth: '80%',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px', textAlign: 'right' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="Ответить клиенту..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                }}
              />
              <button className="btn-primary" type="submit" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
                Отправить
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
