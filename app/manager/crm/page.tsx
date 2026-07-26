'use client';

import React, { useState } from 'react';
import { KitchenTicketPrint, KitchenTicketData } from '../../../components/KitchenTicketPrint';

interface CrmOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhoneMasked: string;
  address: string;
  status: 'NEW' | 'ACCEPTED' | 'SENT_TO_KITCHEN' | 'READY_FOR_DELIVERY' | 'IN_TRANSIT' | 'DELIVERED' | 'PROBLEM';
  itemsSummary: string;
  totalAmount: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

const initialOrders: CrmOrder[] = [
  {
    id: 'ord-101',
    orderNumber: '20260726-0001',
    customerName: 'Мухаммад А.',
    customerPhoneMasked: '+20 12* *** *890',
    address: 'Каир, р-н Наср Сити, ул. Аль-Аббасия 14',
    status: 'NEW',
    itemsSummary: 'Блюдо 1 x2, Блюдо 2 x1',
    totalAmount: 500,
    createdAt: '10:15',
    items: [
      { name: 'Блюдо 1', quantity: 2 },
      { name: 'Блюдо 2', quantity: 1 },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: '20260726-0002',
    customerName: 'Фатима К.',
    customerPhoneMasked: '+20 10* *** *456',
    address: 'Каир, р-н Нового Каира, Проспект 90',
    status: 'ACCEPTED',
    itemsSummary: 'Блюдо 3 x1, Блюдо 4 x2',
    totalAmount: 680,
    createdAt: '10:05',
    items: [
      { name: 'Блюдо 3', quantity: 1 },
      { name: 'Блюдо 4', quantity: 2 },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: '20260726-0003',
    customerName: 'Ахмад Т.',
    customerPhoneMasked: '+20 11* *** *321',
    address: 'Каир, р-н Маади, ул. 105',
    status: 'SENT_TO_KITCHEN',
    itemsSummary: 'Блюдо 1 x1, Блюдо 5 x3',
    totalAmount: 510,
    createdAt: '09:45',
    items: [
      { name: 'Блюдо 1', quantity: 1 },
      { name: 'Блюдо 5', quantity: 3 },
    ],
  },
];

export default function ManagerCrmPage() {
  const [orders, setOrders] = useState<CrmOrder[]>(initialOrders);
  const [activeTicket, setActiveTicket] = useState<KitchenTicketData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('ALL');

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
    updateOrderStatus(order.id, 'SENT_TO_KITCHEN');
  };

  const columns: { status: CrmOrder['status']; title: string; color: string }[] = [
    { status: 'NEW', title: 'Новые заказы', color: 'var(--color-warm-terracotta)' },
    { status: 'ACCEPTED', title: 'Приняты в работу', color: 'var(--color-marigold-zest)' },
    { status: 'SENT_TO_KITCHEN', title: 'На кухне (Печать)', color: 'var(--color-info)' },
    { status: 'READY_FOR_DELIVERY', title: 'Готовы к доставке', color: 'var(--color-success)' },
    { status: 'PROBLEM', title: 'Проблема / Урегулирование', color: 'var(--color-error)' },
  ];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '4px' }}>CRM Менеджера | DAYMOHKCOFEE</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Операционный канбан-контур обработки заказов и бумажной кухни
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span className="badge badge-forest" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Менеджер: Активен
          </span>
        </div>
      </div>

      {/* Sunsama-styled Kanban Board Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                minHeight: '450px',
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
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>{col.title}</h3>
                <span
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
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
                        padding: '14px',
                        border: '1px solid var(--color-border)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ord.orderNumber}</span>
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{ord.createdAt}</span>
                      </div>

                      <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{ord.customerName}</p>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>
                        {ord.customerPhoneMasked}
                      </p>

                      <div
                        style={{
                          backgroundColor: 'var(--color-bg)',
                          padding: '8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          marginBottom: '12px',
                        }}
                      >
                        <strong>Позиции:</strong> {ord.itemsSummary}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-deep-forest)' }}>{ord.totalAmount} EGP</span>
                      </div>

                      {/* Context Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {ord.status === 'NEW' && (
                          <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}
                            onClick={() => updateOrderStatus(ord.id, 'ACCEPTED')}
                          >
                            Принять в работу
                          </button>
                        )}

                        {ord.status === 'ACCEPTED' && (
                          <button
                            className="btn-secondary"
                            style={{ width: '100%', padding: '6px', fontSize: '0.8rem' }}
                            onClick={() => handlePrintKitchenTicket(ord)}
                          >
                            🖨️ Печать чека кухни
                          </button>
                        )}

                        {ord.status === 'SENT_TO_KITCHEN' && (
                          <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '6px', fontSize: '0.8rem', backgroundColor: 'var(--color-success)' }}
                            onClick={() => updateOrderStatus(ord.id, 'READY_FOR_DELIVERY')}
                          >
                            ✓ Отметить готовность
                          </button>
                        )}

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
                              marginTop: '4px',
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

      <KitchenTicketPrint ticket={activeTicket} onClose={() => setActiveTicket(null)} />
    </div>
  );
}
