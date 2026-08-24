'use client';

import React, { useState } from 'react';
import { KitchenTicketPrint, KitchenTicketData } from '../../../components/KitchenTicketPrint';

interface CrmOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhoneMasked: string;
  address: string;
  status: 'NEW' | 'ACCEPTED' | 'COOKING' | 'READY_FOR_DELIVERY' | 'IN_TRANSIT' | 'DELIVERED' | 'PROBLEM';
  itemsSummary: string;
  totalAmount: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
  chatMessages?: { sender: 'CLIENT' | 'MANAGER'; text: string; time: string }[];
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
    chatMessages: [
      { sender: 'CLIENT', text: 'Здравствуйте! Уточните, соус острый?', time: '10:16' },
      { sender: 'MANAGER', text: 'Добрый день! Нет, соус традиционный нежный, острый по желанию.', time: '10:17' },
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
    items: [
      { name: 'Хачапури по-аджарски', quantity: 1 },
      { name: 'Лимонад', quantity: 3 },
    ],
  },
];

export default function ManagerCrmPage() {
  const [orders, setOrders] = useState<CrmOrder[]>(initialOrders);
  const [activeTicket, setActiveTicket] = useState<KitchenTicketData | null>(null);
  const [selectedChatOrder, setSelectedChatOrder] = useState<CrmOrder | null>(null);
  const [chatInputText, setChatInputText] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  const updateOrderStatus = (orderId: string, newStatus: CrmOrder['status']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handlePrintKitchenTicket = (order: CrmOrder) => {
    const ticketData: KitchenTicketData = {
      ticketNumber: Math.floor(100 + Math.random() * 900),
      orderNumber: order.orderNumber,
      printedAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      items: order.items,
    };
    setActiveTicket(ticketData);
    updateOrderStatus(order.id, 'COOKING');
  };

  // Courier Copy Helper (Universal Clipboard)
  const handleCopyForCourier = (order: CrmOrder) => {
    const text = `🛵 *ЗАКАЗ НА ДОСТАВКУ #${order.orderNumber}*
👤 Клиент: ${order.customerName} (${order.customerPhoneMasked})
📍 Адрес: ${order.address}
🍲 Блюда: ${order.itemsSummary}
💰 К оплате: ${order.totalAmount} EGP`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setNotification(`✓ Детали заказа #${order.orderNumber} скопированы в буфер обмена!`);
    } else {
      alert(text);
    }
  };

  // Send Chat Message as Manager
  const handleSendChatMessage = () => {
    if (!selectedChatOrder || !chatInputText.trim()) return;

    const newMsg = {
      sender: 'MANAGER' as const,
      text: chatInputText.trim(),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === selectedChatOrder.id) {
          const updatedChat = [...(o.chatMessages || []), newMsg];
          setSelectedChatOrder({ ...o, chatMessages: updatedChat });
          return { ...o, chatMessages: updatedChat };
        }
        return o;
      })
    );
    setChatInputText('');
  };

  const columns: { status: CrmOrder['status']; title: string; color: string }[] = [
    { status: 'NEW', title: 'Новые заказы', color: 'var(--color-warm-terracotta)' },
    { status: 'ACCEPTED', title: 'Приняты в работу', color: 'var(--color-marigold-zest)' },
    { status: 'COOKING', title: 'На кухне (В готовке)', color: 'var(--color-info)' },
    { status: 'READY_FOR_DELIVERY', title: 'Готовы к доставке', color: 'var(--color-success)' },
    { status: 'PROBLEM', title: 'Проблема / Урегулирование', color: 'var(--color-error)' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="badge badge-forest">CRM Менеджера</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>● Realtime WebSocket Enabled</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', margin: '6px 0 0 0', fontWeight: 800 }}>CRM Менеджера | DAYMOHKCOFEE</h1>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className="animate-fade-in"
          style={{
            backgroundColor: 'rgba(46, 125, 50, 0.15)',
            border: '1px solid var(--color-success)',
            color: 'var(--color-success)',
            padding: '14px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>✓ {notification}</span>
          <button
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Sunsama-styled Kanban Board Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);
          return (
            <div
              key={col.status}
              style={{
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                border: '1px solid var(--color-border)',
                minHeight: '480px',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `3px solid ${col.color}`,
                }}
              >
                <h3 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>{col.title}</h3>
                <span
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {colOrders.length === 0 ? (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
                    Нет заказов
                  </p>
                ) : (
                  colOrders.map((ord) => (
                    <div
                      key={ord.id}
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--color-deep-forest)' }}>
                          {ord.orderNumber}
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
                        <button
                          onClick={() => setSelectedChatOrder(ord)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-deep-forest)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          💬 Чат ({ord.chatMessages?.length || 0})
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

                        {ord.status !== 'PROBLEM' && (
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'PROBLEM')}
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
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat Drawer Modal */}
      {selectedChatOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            className="animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '450px',
              backgroundColor: 'var(--color-surface)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Chat Modal Header */}
            <div
              style={{
                padding: '20px',
                backgroundColor: 'var(--color-deep-forest)',
                color: 'var(--color-vanilla-cream)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#FFF' }}>
                  💬 Чат по заказу #{selectedChatOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Клиент: {selectedChatOrder.customerName}
                </span>
              </div>
              <button
                onClick={() => setSelectedChatOrder(null)}
                style={{ background: 'none', border: 'none', color: '#FFF', fontSize: '1.5rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* Chat Messages Body */}
            <div style={{ padding: '20px', flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {!selectedChatOrder.chatMessages || selectedChatOrder.chatMessages.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: 'auto' }}>
                  В этом чате пока нет сообщений.
                </p>
              ) : (
                selectedChatOrder.chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      alignSelf: msg.sender === 'MANAGER' ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      backgroundColor: msg.sender === 'MANAGER' ? 'var(--color-deep-forest)' : 'var(--color-surface-subtle)',
                      color: msg.sender === 'MANAGER' ? 'var(--color-vanilla-cream)' : 'var(--color-text-primary)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div>{msg.text}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>
                      {msg.sender === 'MANAGER' ? 'Вы (Менеджер)' : 'Клиент'} • {msg.time}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Input Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Напишите ответ клиенту..."
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                style={{
                  flexGrow: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button onClick={handleSendChatMessage} className="btn-primary" style={{ padding: '12px 18px' }}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      <KitchenTicketPrint ticket={activeTicket} onClose={() => setActiveTicket(null)} />
    </div>
  );
}
