'use client';

import React, { useState } from 'react';

export interface CrmOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhoneMasked: string;
  address: string;
  status: 'NEW' | 'ACCEPTED' | 'COOKING' | 'READY_FOR_DELIVERY' | 'DELIVERING' | 'COMPLETED' | 'PROBLEM';
  itemsSummary: string;
  totalAmount: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
  chatMessages?: { sender: 'CLIENT' | 'MANAGER'; text: string; time: string }[];
  unreadMessagesCount?: number;
}

const initialOrders: CrmOrder[] = [
  {
    id: 'ord-101',
    orderNumber: '20260824-0001',
    customerName: 'Мухаммад А.',
    customerPhoneMasked: '+20 12* *** *890',
    address: 'Каир, р-н Наср Сити, ул. Аль-Аббасия 14',
    status: 'NEW',
    itemsSummary: 'Люля-кебаб x2, Лимонад x1',
    totalAmount: 480,
    createdAt: '10:15',
    items: [
      { name: 'Люля-кебаб', quantity: 2 },
      { name: 'Лимонад', quantity: 1 },
    ],
    unreadMessagesCount: 2,
    chatMessages: [
      { sender: 'CLIENT', text: 'Здравствуйте! Уточните, соус острый?', time: '10:16' },
      { sender: 'CLIENT', text: 'И можно положить больше салфеток?', time: '10:17' },
      { sender: 'MANAGER', text: 'Добрый день! Нет, соус традиционный нежный. Салфетки добавим!', time: '10:18' },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: '20260824-0002',
    customerName: 'Фатима К.',
    customerPhoneMasked: '+20 10* *** *456',
    address: 'Каир, р-н Нового Каира, Проспект 90',
    status: 'ACCEPTED',
    itemsSummary: 'Шашлык x1, Суп дня x2',
    totalAmount: 700,
    createdAt: '10:05',
    unreadMessagesCount: 0,
    items: [
      { name: 'Шашлык из курицы', quantity: 1 },
      { name: 'Суп дня', quantity: 2 },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: '20260824-0003',
    customerName: 'Ахмад Т.',
    customerPhoneMasked: '+20 11* *** *321',
    address: 'Каир, р-н Маади, ул. 105',
    status: 'COOKING',
    itemsSummary: 'Хачапури x1, Лимонад x3',
    totalAmount: 840,
    createdAt: '09:45',
    unreadMessagesCount: 1,
    items: [
      { name: 'Хачапури по-аджарски', quantity: 1 },
      { name: 'Лимонад', quantity: 3 },
    ],
    chatMessages: [
      { sender: 'CLIENT', text: 'Сколько примерно осталось времени готовки?', time: '09:50' },
    ],
  },
];

export default function ManagerCrmPage() {
  const [orders, setOrders] = useState<CrmOrder[]>(initialOrders);
  const [selectedChatOrder, setSelectedChatOrder] = useState<CrmOrder | null>(null);
  const [newMsgText, setNewMsgText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Status columns in Kanban
  const columns: { title: string; status: CrmOrder['status']; color: string }[] = [
    { title: 'Новые заказы', status: 'NEW', color: 'var(--color-marigold-zest)' },
    { title: 'Приняты в работу', status: 'ACCEPTED', color: 'var(--color-deep-forest)' },
    { title: 'Готовятся', status: 'COOKING', color: 'var(--color-deep-forest)' },
    { title: 'Готовы к выдаче', status: 'READY_FOR_DELIVERY', color: 'var(--color-success)' },
    { title: 'Доставляются', status: 'DELIVERING', color: 'var(--color-deep-forest)' },
    { title: 'Завершённые', status: 'COMPLETED', color: 'var(--color-text-muted)' },
    { title: 'Проблема / Урегулирование', status: 'PROBLEM', color: 'var(--color-error)' },
  ];

  // Open Chat Drawer and Reset Unread Counter to 0
  const handleOpenChat = (order: CrmOrder) => {
    setSelectedChatOrder(order);
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, unreadMessagesCount: 0 } : o))
    );
  };

  const updateOrderStatus = (orderId: string, newStatus: CrmOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
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
    alert(`🍳 Чек заказа #${order.orderNumber} отправлен на кухню!\nСтатус изменён на "COOKING".`);
  };

  // Send message in chat
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatOrder || !newMsgText.trim()) return;

    const newMsg = {
      sender: 'MANAGER' as const,
      text: newMsgText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedChatOrder.id) {
          const updatedChat = [...(o.chatMessages || []), newMsg];
          setSelectedChatOrder({ ...o, chatMessages: updatedChat });
          return { ...o, chatMessages: updatedChat, unreadMessagesCount: 0 };
        }
        return o;
      })
    );

    setNewMsgText('');
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <span className="badge badge-forest" style={{ marginBottom: '4px' }}>Рабочий контур</span>
          <h1 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 800 }}>CRM Менеджера Заказов DAYMOHKCOFEE</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <a href="/kitchen/dashboard" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            🍳 Электронный экран повара (KDS)
          </a>
          <a href="/admin/dashboard" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            ⚙️ Админка
          </a>
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '24px',
        }}
      >
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);

          return (
            <div
              key={col.status}
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                border: '1px solid var(--color-border)',
                minWidth: '270px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: `2px solid ${col.color}`,
                }}
              >
                <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>{col.title}</h3>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {colOrders.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '24px 0',
                      color: 'var(--color-text-muted)',
                      fontSize: '0.85rem',
                      fontStyle: 'italic',
                    }}
                  >
                    Нет заказов
                  </div>
                ) : (
                  colOrders.map((ord) => (
                    <div
                      key={ord.id}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-deep-forest)' }}>
                            #{ord.orderNumber}
                          </span>
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{ord.createdAt}</span>
                        </div>

                        <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>{ord.customerName}</p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>
                          📍 {ord.address}
                        </p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
                          📞 {ord.customerPhoneMasked}
                        </p>

                        <div
                          style={{
                            backgroundColor: 'var(--color-surface-subtle)',
                            padding: '8px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.85rem',
                            marginBottom: '12px',
                          }}
                        >
                          <strong>Состав:</strong> {ord.itemsSummary}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-deep-forest)' }}>
                            {ord.totalAmount} EGP
                          </span>

                          {/* Chat Launcher Button with Live Unread Messages Counter */}
                          <button
                            onClick={() => handleOpenChat(ord)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              border: ord.unreadMessagesCount && ord.unreadMessagesCount > 0 ? 'none' : '1px solid var(--color-border)',
                              backgroundColor: ord.unreadMessagesCount && ord.unreadMessagesCount > 0 ? 'var(--color-warm-terracotta)' : 'var(--color-surface)',
                              color: ord.unreadMessagesCount && ord.unreadMessagesCount > 0 ? '#FFF' : 'var(--color-deep-forest)',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              boxShadow: ord.unreadMessagesCount && ord.unreadMessagesCount > 0 ? 'var(--shadow-sm)' : 'none',
                            }}
                          >
                            💬 Чат {ord.unreadMessagesCount && ord.unreadMessagesCount > 0 ? `🔴 (${ord.unreadMessagesCount} нов.)` : `(${ord.chatMessages?.length || 0})`}
                          </button>
                        </div>

                        {/* Context Actions */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {ord.status === 'NEW' && (
                            <button
                              className="btn-primary"
                              style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                              onClick={() => updateOrderStatus(ord.id, 'ACCEPTED')}
                            >
                              Принять в работу
                            </button>
                          )}

                          {ord.status === 'ACCEPTED' && (
                            <button
                              className="btn-secondary"
                              style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                              onClick={() => handlePrintKitchenTicket(ord)}
                            >
                              🍳 Отправить на Кухню (Печать)
                            </button>
                          )}

                          {ord.status === 'COOKING' && (
                            <button
                              className="btn-primary"
                              style={{ width: '100%', padding: '8px', fontSize: '0.85rem', backgroundColor: 'var(--color-success)' }}
                              onClick={() => updateOrderStatus(ord.id, 'READY_FOR_DELIVERY')}
                            >
                              ✓ Отметить готовность
                            </button>
                          )}

                          {/* Universal Courier Copy Button */}
                          <button
                            onClick={() => handleCopyForCourier(ord)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-success)',
                              backgroundColor: 'rgba(46, 125, 50, 0.08)',
                              color: 'var(--color-success)',
                              fontWeight: 700,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            📋 Скопировать детали для курьера
                          </button>

                          {ord.status === 'PROBLEM' && (
                            <button
                              className="btn-primary"
                              style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '0.85rem',
                                backgroundColor: 'var(--color-deep-forest)',
                              }}
                              onClick={() => {
                                updateOrderStatus(ord.id, 'ACCEPTED');
                                setNotification(`✓ Заказ #${ord.orderNumber} выведен из урегулирования и возвращён в работу!`);
                              }}
                            >
                              ↩️ Вернуть заказ в работу
                            </button>
                          )}

                          {ord.status !== 'PROBLEM' && (
                            <button
                              onClick={() => {
                                updateOrderStatus(ord.id, 'PROBLEM');
                                setNotification(`⚠️ Заказ #${ord.orderNumber} отправлен в урегулирование.`);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--color-error)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                textAlign: 'center',
                                marginTop: '2px',
                              }}
                            >
                              ⚠️ Эскалация в урегулирование
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

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
              {(!selectedChatOrder.chatMessages || selectedChatOrder.chatMessages.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Сообщений по заказу пока нет
                </div>
              ) : (
                selectedChatOrder.chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
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
                      {msg.time}
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
